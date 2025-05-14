# 反向代理

CdsCTF 支持且推荐使用 Nginx 或 Caddy 进行反向代理，最直接的理由是这样能够最方便地支持 TLS。

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

        root /var/www/html;
        gzip on;
        gzip_static on;
        gzip_comp_level 6;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        gzip_proxied any;
        gzip_vary on;

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

```text

```
