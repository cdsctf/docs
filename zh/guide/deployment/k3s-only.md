# 仅 K3s

在这种部署方法中，你只需要 K3s 就行了，但这里并不会教你如何组建 K3s 集群，所以这里只会演示在单机的 K3s 上部署 CdsCTF 和衍生服务。

在开始之前，你可能需要准备一个 [Helm](https://helm.sh/)。

你如果无法正常使用 `helm` 命令，可以先输入一遍这个命令：

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

接下来，你需要添加 CdsCTF 的 [Helm 仓库](https://github.com/cdsctf/helm-charts)：

```bash
helm repo add cdsctf https://cdsctf.github.io/helm-charts
```

默认的配置可以参考 [`values.yaml`](https://github.com/cdsctf/helm-charts/blob/main/charts/cdsctf/values.yaml)。

在此讲解更常用的情况，即对 CdsCTF 实例使用 NodePort 而非 ClusterIP 的方式进行访问。

在本地准备一个 `vales.yaml` 文件，内容如下：

```yaml
server:
  service:
    type: NodePort
    nodePort: 8888
```

然后执行：

```
helm install cdsctf cdsctf/cdsctf -f values.yaml
```

推荐在末尾加上 `-n cdsctf`，将 CdsCTF 与其他 Kubernetes 资源隔离。

如果你有使用 Ingress 或 IngressRoute 的需求，你依然可以自行进行配置，以下是一个示例 `ingressroute.yaml`：

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: server
spec:
  entryPoints:
    - websecure
    - web
  routes:
    - match: Host(`ctf.e23.dev`)
      kind: Rule
      services:
        - name: server
          port: 8888
```

但是还需要补充一点，就是 Traefik 可能没法正确处理 XFF 等请求头，导致 CdsCTF 无法正确解析客户端的真实 IP，这里提供一个方法，帮助你解决这个问题，如果你是 Helm 部署的 Traefik 的话，可以在 Traefik 的 `values.yaml` 中这么写。

```yaml
service:
  spec:
    externalTrafficPolicy: Local

ports:
  web:
      insecure: true
    proxyProtocol:
      insecure: true
  websecure:
    forwardedHeaders:
      insecure: true
    proxyProtocol:
      insecure: true
```
