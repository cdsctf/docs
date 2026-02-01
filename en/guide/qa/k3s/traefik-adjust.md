# Traefik Adjust

Accessing the host on ports 80 or 443 and getting `404 page not found` is **normal when K3s is installed without excluding Traefik** (i.e. without `--disable=traefik`). K3s bundles Traefik by default and binds it to 80/443, so until you configure Ingress or change the service, those ports will show this response.

To free ports 80 and 443 on the host (e.g. for Docker + K3s or other services), you can change Traefik’s Service so it no longer uses them:

```bash
kubectl -n kube-system edit service traefik
```

Change the two `port` values as follows:

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

After this, ports 80 and 443 on the host will be available for other processes (e.g. your reverse proxy or CdsCTF).
