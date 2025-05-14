# 证书重置

若 CdsCTF 后端在正确配置了地址后仍然无法连接 Kubernetes，通常这种问题是在使用 Docker + K3s 部署的情况下发生的。

底层原因通常是 `x509: certificate is valid`，所以我们需要为 K3s 重新配置一次证书。

先停止 K3s 服务：

```bash
sudo systemctl stop k3s
```

备份现有的证书：

```bash
sudo cp /var/lib/rancher/k3s/server/tls/server-ca.crt /var/lib/rancher/k3s/server/tls/server-ca.crt.bak
sudo cp /var/lib/rancher/k3s/server/tls/server-ca.key /var/lib/rancher/k3s/server/tls/server-ca.key.bak
```

编辑 K3s 的配置文件 `/etc/rancher/k3s/config.yaml`，在其中添加一条 `tls-san`：

```yaml
tls-san:
    - 172.20.0.1 # 即宿主机相对于 CdsCTF 后端的位置
```

随后删除原有的证书：

```bash
sudo rm /var/lib/rancher/k3s/server/tls/server-ca.crt
sudo rm /var/lib/rancher/k3s/server/tls/server-ca.key
```

重启 K3s 服务，此时证书会重新生成：

```bash
sudo systemctl start k3s
```
