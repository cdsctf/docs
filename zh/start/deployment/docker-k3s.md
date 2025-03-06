# Docker + K3s

先来解释一下关系，在这种部署方法中，CdsCTF 及其中间件（Kubernetes 除外）都依赖于 Docker 运行，而 K8s 则仅是作为 CdsCTF 的题目动态环境提供者。

但是这么多个中间件，如果依靠独立的 Docker 命令进行管理会显得冗杂，所以我们需要使用 Docker Compose。

可以先建立一个空目录，然后在里面新建一个文件 `compose.yml`，这里便记录了 CdsCTF 和其中间件的镜像及依赖关系。

```yaml
version: "3.0"
services:
    nginx:
        image: nginx:alpine
        restart: always
        ports:
            - "80:80"
            - "443:443"
        volumes:
            - "frontend:/var/www/html/:ro"
            - "./nginx.conf:/etc/nginx/nginx.conf"
        depends_on:
            - frontend
            - backend
        networks:
            cdsnet:

    frontend:
        image: elabosak233/cdsuno:main
        volumes:
            - "frontend:/var/www/html"
        networks:
            cdsnet:

    backend:
        image: elabosak233/cdsctf:main
        restart: always
        volumes:
            - "backend:/app"
            - "./application.toml:/app/application.toml:ro"
            - "./k8s-config.yml:/app/k8s-config.yml"
        depends_on:
            - db
            - queue
            - cache
        networks:
            cdsnet:
                ipv4_address: "172.20.0.10"

    db:
        image: postgres:alpine
        restart: always
        environment:
            POSTGRES_USER: cdsctf
            POSTGRES_PASSWORD: cdsctf
            POSTGRES_DB: cdsctf
        volumes:
            - "db:/var/lib/postgresql/data"
        networks:
            cdsnet:

    queue:
        image: nats:alpine
        restart: always
        command:
            - "--js"
            - "--sd=/data"
        volumes:
            - "queue:/data"
        networks:
            cdsnet:

    cache:
        image: valkey/valkey:alpine
        restart: always
        volumes:
            - "cache:/data"
        networks:
            cdsnet:

volumes:
    frontend:
    backend:
    db:
    queue:
    cache:

networks:
    cdsnet:
        driver: bridge
        ipam:
            driver: default
            config:
                - subnet: "172.20.0.0/24"
```

如果你在短时间内无法理解这段 Compose，不妨寻求 LLM 的帮助。

这里我们定义了一个 Docker 网络 `cdsnet`，并且 IP 段在 `172.20.0.0/24` 内，即所有在此 Compose 文件中提到的容器，其网络地址都会处于这段区间内。但有一个比较特殊，即 backend，我们指定了其 IP 地址为 `172.20.0.10`。当然，这些配置你都可以随意更改。后续会解释为什么建议预先设定好网络。

在创建好 `compose.yml` 之后，我们需要准备三个文件，`application.toml`、 `k8s-config.yml` 和 `nginx.conf`，将其放在 `compose.yml` 的同目录。如果你研究过上文的 `compose.yml`，不难发现两个文件将被提供给 backend，即 CdsCTF 的真正后端，剩余一个文件将提供给 nginx。

如果你不知道什么是 Nginx，可以先去了解一下。如果你喜欢 Caddy，也可以自行更换。如果你不想使用 Docker Compose 的 Nginx，而是使用宿主机的 Nginx，也可以自行去除。这里给出一个推荐的基础版 `nginx.conf`（若有意愿使用 SSL，请自行研究）：

```nginx
events {}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server backend:8888;
    }

    server {
        listen 80;
        listen [::]:80;
        
        root /var/www/html;
        gzip on;
        gzip_static on;
        gzip_comp_level 6;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        gzip_proxied any;
        gzip_vary on;

        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location ~ ^/(api) {
            client_max_body_size 1024M;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_redirect off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Host $server_name;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

这里将不过多赘述 `application.toml` 的具体写法，`k8s-config.yml` 也是你在 *快速开始* 中通过命令获得的。

但我们需要对 `application.toml` 中的一些地址定义做些可能的改变。

比如 `db.host`，需要写成 db，而非具体的 IP 地址。因为在 Docker Compose 中，服务可以直接使用服务名称（在这个案例中为 db）作为主机名来访问彼此。那么一次类推，针对缓存、消息队列的配置也是如此。

我们还需要对 `k8s-config.yml` 做出一些小小的改变，你最开始获得的 `k8s-config.yml` 长这样：

```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: ...
      server: https://127.0.0.1:6443
    name: default
# ...
```

如果你的 `compose.yml` 对于网络的配置与上文写法一致，那么你需要改成这样：

```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: ...
      server: https://172.20.0.1:6443
    name: default
# ...
```

解释一下原因，实际上需要对 Kubernetes 进行控制的是 CdsCTF 的 backend。那么对于 backend 而言，Kubernetes 并不存在于 `127.0.0.1`，而是在此 Docker 网络下的宿主机 `172.20.0.1`（通常最后一位是 `1`）。

此时如果你在目录下运行 `docker compose up` 启动这个 Compose，你若发现 backend 的报错是无法连接 Cluster，我们需要为 K3s 重新配置一下证书，具体可参考 [Q&A](/zh/start/qa/k3s/cert-reset)。

如果顺利启动了，你可以通过 `http://127.0.0.1` 进入 CdsCTF，但你会发现 K3s 携带的 Traefik 可能拦截了你的请求，给了你一个 `404 page not found` 的返回，此时我们需要对 Traefik 做一些处理（或者你也可以改变 Nginx 的映射端口到 `80` 和 `443` 以外的端口），参考 [这篇文章](/zh/start/qa/k3s/traefik-adjust)。

此时运行 `docker compose up -d`，即可顺利启动 CdsCTF。