# Docker + K3s

先来解释一下关系，在这种部署方法中，CdsCTF 及其中间件（Kubernetes 除外）都依赖于 Docker 运行，而 K8s 则仅是作为 CdsCTF 的题目动态环境提供者。

但是这么多个中间件，如果依靠独立的 Docker 命令进行管理会显得冗杂，所以我们需要使用 Docker Compose。

可以先建立一个空目录，然后在里面新建一个文件 `compose.yml`，这里便记录了 CdsCTF 和其中间件的镜像及依赖关系。

```yaml
version: "3.0"
services:
    backend:
        image: elabosak233/cdsctf:main
        ports:
            - "127.0.0.1:8888:8888"
        restart: always
        volumes:
            - "backend:/app/data"
            - "./configs:/app/data/configs"
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
    
    telemetry:
        image: otel/opentelemetry-collector:latest
        ports:
            - "127.0.0.1:2345:2345"
        volumes:
            - "./otel-config.yml:/otel-config.yml:ro"
        command: ["--config", "/otel-config.yml"]
        restart: unless-stopped
        networks:
            cdsnet:

volumes:
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

在创建好 `compose.yml` 之后，我们需要准备一个 `nginx.conf`，提供给 Nginx。

如果你不知道什么是 Nginx，可以先去了解一下。如果你喜欢 Caddy，也可以自行更换。如果你不想使用 Docker Compose 的 Nginx，而是使用宿主机的 Nginx，也可以自行去除。这里给出一个推荐的基础版 `nginx.conf`（若有意愿使用 SSL，请自行研究）：

然后我们需要在同一个目录下创建 `/configs` 目录，这个目录将提供给 CdsCTF 的后端，用于生成配置和修改配置。

你可以直接通过 `docker compose up` 使得 CdsCTF 自动创建两个配置文件（`constant.toml` 和 `variable.toml`）。以及你还需要向目录中添加一个 `k8s.yml`，就像 *快速开始* 中说的那样。

我们需要对 `constant.toml` 中的一些地址定义做些可能的改变。

比如 `db.host`，需要写成 db，而非具体的 IP 地址。因为在 Docker Compose 中，服务可以直接使用服务名称（在这个案例中为 db）作为主机名来访问彼此。那么一次类推，针对缓存、消息队列的配置也是如此。

我们还需要对 `k8s.yml` 做出一些小小的改变，你最开始获得的 `k8s.yml` 长这样：

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