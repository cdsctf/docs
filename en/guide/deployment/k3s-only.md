# K3s Only

In this deployment method, you only need K3s. However, this guide will not teach you how to set up a K3s cluster. Instead, it will demonstrate how to deploy CdsCTF and its related services on a single-node K3s instance using the official [Helm Chart](https://github.com/cdsctf/helm-charts).

Before you begin, you might want to prepare [Helm](https://helm.sh/).

> [!NOTE]
> Telemetry facilities (e.g. OpenTelemetry Collector) are **not** provided with the Helm Chart. If you need observability, see [Observability](../derivative/observability) and deploy a Collector and backends yourself.

If you can't use the `helm` command properly, try running this command first:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Next, add the CdsCTF [Helm repository](https://github.com/cdsctf/helm-charts):

```bash
helm repo add cdsctf https://cdsctf.github.io/helm-charts
```

You can refer to the default configuration in [`values.yaml`](https://github.com/cdsctf/helm-charts/blob/main/charts/cdsctf/values.yaml).

Below we cover the common case: exposing the CdsCTF instance via NodePort instead of ClusterIP.

Create a local `values.yaml` with:

```yaml
server:
  service:
    type: NodePort
    nodePort: 8888
```

Then run:

```bash
helm install cdsctf cdsctf/cdsctf -f values.yaml
```

It is recommended to add `-n cdsctf` at the end to isolate CdsCTF from other Kubernetes resources.

If you need Ingress or IngressRoute, you can configure it yourself. Here is an example `ingressroute.yaml`:

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

One more note: Traefik may not correctly handle X-Forwarded-For (XFF) and similar headers, which can prevent CdsCTF from resolving the real client IP. If you deployed Traefik with Helm, you can add the following to Traefik's `values.yaml`:

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
