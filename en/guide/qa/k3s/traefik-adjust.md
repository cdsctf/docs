# Traefik 调整

我们通过改变 Traefik 的 service 来解决宿主机 80 和 443 端口只返回 `404 page not found` 的问题：

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
