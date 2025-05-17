# Cert Reset

If the CdsCTF backend still fails to connect to Kubernetes after correctly configuring the address, the issue often arises when deploying with Docker + K3s.

The root cause is typically related to a certificate error like: `x509: certificate is valid`. To resolve this, we need to reconfigure the certificates for K3s.

Stop the K3s service:

```bash
sudo systemctl stop k3s
```

Back up the existing certificates:

```bash
sudo cp /var/lib/rancher/k3s/server/tls/server-ca.crt /var/lib/rancher/k3s/server/tls/server-ca.crt.bak
sudo cp /var/lib/rancher/k3s/server/tls/server-ca.key /var/lib/rancher/k3s/server/tls/server-ca.key.bak
```

Edit the K3s configuration, open `/etc/rancher/k3s/config.yaml` and add a tls-san entry:

```yaml
tls-san:
  - 172.20.0.1 # This should be the host IP address as seen from the CdsCTF backend
```

Delete the original certificates:

```bash
sudo rm /var/lib/rancher/k3s/server/tls/server-ca.crt
sudo rm /var/lib/rancher/k3s/server/tls/server-ca.key
```

Restart K3s to regenerate the certificates:

```bash
sudo systemctl start k3s
```
