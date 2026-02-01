# Traefik 调整

访问宿主机 80 或 443 端口时出现 `404 page not found`，**通常是没有排除 Traefik 就安装 K3s 时的正常表现**（即安装时未使用 `--disable=traefik`）。K3s 默认会捆绑 Traefik 并占用 80/443，在未配置 Ingress 或未调整该服务前，这两个端口就会返回上述页面。

若希望释放宿主机 80 和 443 端口（例如用于 Docker + K3s 或其他服务），可以通过修改 Traefik 的 Service 来实现：

```bash
kubectl -n kube-system edit service traefik
```

更改两个 `port`：

```yaml
ports:
  - name: web
    nodePort: ...
    port: 8080
    protocol: TCP
    targetPort: web
  - name: websecure
    nodePort: ...
    port: 8443
    protocol: TCP
    targetPort: websecure
```

这样一来，宿主机的 80 和 443 端口将由其他进程接管。
