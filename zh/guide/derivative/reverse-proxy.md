# 反向代理

在未配置默认的反向代理（如 Traefik）的前提下，CdsCTF 也支持且推荐使用 Nginx 或 Caddy 进行反向代理。

## Nginx

这里提供一个最简单的 `nginx.conf`。

```nginx
events {}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server 127.0.0.1:8888;
    }

    server {
        listen 80;
        listen [::]:80;

        location / {
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

## Caddy

同样地，也有 `Caddyfile`。

```text
example.com {
    reverse_proxy 127.0.0.1:8888
}
```
