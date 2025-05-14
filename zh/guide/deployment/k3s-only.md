# 仅 K3s

在这种部署方法中，你只需要 K3s 就行了，但这里并不会教你如何组建 K3s 集群，所以这里只会演示在单机的 K3s 上部署 CdsCTF 和衍生服务。

在开始之前，你可能需要准备一个 [Helm](https://helm.sh/)，等等，不要想多了，CdsCTF 还没有制作出一个可以通用的 Helm Chart，我只是觉得，这样部署起来方便一些。

你如果无法正常使用 `helm` 命令，可以先输入一遍这个命令：

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

然后新建一个空目录，我们开始了。

先新建一个 `Chart.yaml`，写入以下内容，只要让 Helm 觉得这是一个 Chart 就行了，不一定要按照我的来。以及在实践过程中，默认的命名空间认定为 `cdsctf`。

```yaml
apiVersion: v2
name: cdsctf
description: A Helm chart to deploy CdsCTF on Kubernetes.
type: application
version: 1.0.0
```

然后新建一个目录 `templates`，接下来大部分文件都会写在这里面。

先写一个 `serviceaccount.yaml`，这个文件将给 CdsCTF 提供集群的访问账户。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
    name: cdsctf-sa
```

随后我们需要搭配一个 ClusterRoleBinding 来给予 `cdsctf-sa` 权限，这个可以与 Helm 无关，所以可以选择放到外面用。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
    name: cdsctf-crb
roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: cluster-admin
subjects:
    - kind: ServiceAccount
      name: cdsctf-sa
      namespace: cdsctf # 记得改命名空间
```

再写一个 `deployment.yaml`。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: backend
spec:
    replicas: 1
    selector:
        matchLabels:
            app: backend
    template:
        metadata:
            labels:
                app: backend
        spec:
            serviceAccountName: cdsctf-sa # 赋予 ServiceAccount
            containers:
                - name: backend
                  image: elabosak233/cdsctf:latest
                  ports:
                      - containerPort: 8888
                  volumeMounts:
                      - name: backend-storage
                        mountPath: /app/data/media
                      - name: backend-config
                        mountPath: /etc/cdsctf/config.toml
                        subPath: config.toml
            volumes:
                - name: backend-storage
                  persistentVolumeClaim:
                      claimName: backend-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: db
spec:
    replicas: 1
    selector:
        matchLabels:
            app: db
    template:
        metadata:
            labels:
                app: db
        spec:
            containers:
                - name: postgres
                  image: postgres:alpine
                  env:
                      - name: POSTGRES_USER
                        value: cdsctf
                      - name: POSTGRES_PASSWORD
                        value: cdsctf
                      - name: POSTGRES_DB
                        value: cdsctf
                  ports:
                      - containerPort: 5432
                  volumeMounts:
                      - name: db-storage
                        mountPath: /var/lib/postgresql/data
            volumes:
                - name: db-storage
                  persistentVolumeClaim:
                      claimName: db-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: queue
spec:
    replicas: 1
    selector:
        matchLabels:
            app: queue
    template:
        metadata:
            labels:
                app: queue
        spec:
            containers:
                - name: queue
                  image: nats:alpine
                  args:
                      - "--http_port=8222"
                      - "--js"
                      - "--sd=/data"
                  ports:
                      - containerPort: 4222
                  volumeMounts:
                      - name: queue-storage
                        mountPath: /data
            volumes:
                - name: queue-storage
                  persistentVolumeClaim:
                      claimName: queue-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: cache
spec:
    replicas: 1
    selector:
        matchLabels:
            app: cache
    template:
        metadata:
            labels:
                app: cache
        spec:
            containers:
                - name: cache
                  image: valkey/valkey:alpine
                  volumeMounts:
                      - name: cache-storage
                        mountPath: /data
            volumes:
                - name: cache-storage
                  persistentVolumeClaim:
                      claimName: cache-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: telemetry
spec:
    replicas: 1
    selector:
        matchLabels:
            app: telemetry
    template:
        metadata:
            labels:
                app: telemetry
        spec:
            containers:
                - name: telemetry
                  image: otel/opentelemetry-collector:latest
                  args:
                      - "--config"
                      - "/otel-config.yml"
                  volumeMounts:
                      - name: otel-config
                        mountPath: /otel-config.yml
                        subPath: otel-config.yml
            volumes:
                - name: otel-config
                  configMap:
                      name: telemetry-config
```

然后是 `pv.yaml`，这一步得看各自的需求，并不是所有人都需要映射到一个具体的目录，所以，请你看着改一改。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
    name: backend-pv
spec:
    capacity:
        storage: 64Gi
    volumeMode: Filesystem
    accessModes:
        - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: backend-storage

    # 请务必修改
    local:
        path: /home/ela/cdsctf/backend/media
    nodeAffinity:
        required:
            nodeSelectorTerms:
                - matchExpressions:
                      - key: kubernetes.io/hostname
                        operator: In
                        values:
                            - ubuntu

---
apiVersion: v1
kind: PersistentVolume
metadata:
    name: db-pv
spec:
    capacity:
        storage: 2Gi
    volumeMode: Filesystem
    accessModes:
        - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: db-storage

    # 请务必修改
    local:
        path: /home/ela/cdsctf/db/data
    nodeAffinity:
        required:
            nodeSelectorTerms:
                - matchExpressions:
                      - key: kubernetes.io/hostname
                        operator: In
                        values:
                            - ubuntu
```

既然有 PV 了，那肯定要有 PVC 啦，这个是 `pvc.yaml`。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: backend-pvc
spec:
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
            storage: 60Gi
    storageClassName: backend-storage

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: db-pvc
spec:
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
            storage: 2Gi
    storageClassName: db-storage

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: queue-pvc
spec:
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
            storage: 1Gi

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: cache-pvc
spec:
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
            storage: 1Gi
```

然后是 `configmap.yaml`。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: backend-config
data:
    config.toml: |
    # 填充 CdsCTF 配置文件的内容
---
apiVersion: v1
kind: ConfigMap
metadata:
    name: telemetry-config
data:
    otel-config.yml: |
        receivers:
          otlp:
            protocols:
              grpc:
                endpoint: "0.0.0.0:4317"
              http:
                endpoint: "0.0.0.0:4318"

        exporters:
          debug:
            verbosity: "detailed"

          prometheus:
            endpoint: "0.0.0.0:2345"  # For Prometheus to collect Collector metrics
            namespace: "otel"

          otlphttp/loki:
            endpoint: "http://<your_loki_address>:3100/otlp"

          otlp/jaeger:
            endpoint: "http://<your_jaeger_address>:4317"
            tls:
              insecure: true

        processors:
          batch:

        service:
          pipelines:
            metrics:
              receivers: [otlp]
              processors: [batch]
              exporters: [prometheus]
            logs:
              receivers: [otlp]
              processors: [batch]
              exporters: [debug]
            traces:
              receivers: [otlp]
              processors: [batch]
              exporters: [debug]
```

接下来的这些配置因人而异，这边演示的是使用 Traefik IngressRoute 的方法，先是 `service.yaml`。

```yaml
apiVersion: v1
kind: Service
metadata:
    name: backend
    labels:
        app: backend
    annotations:
        traefik.ingress.kubernetes.io/service.sticky.cookie: "true"
        traefik.ingress.kubernetes.io/service.sticky.cookie.name: "LB_Session"
        traefik.ingress.kubernetes.io/service.sticky.cookie.httponly: "true"
spec:
    ports:
        - port: 8888
          protocol: TCP
    selector:
        app: backend
    type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
    name: telemetry
    labels:
        app: telemetry
spec:
    ports:
        - port: 4317
          protocol: TCP
    selector:
        app: telemetry
    type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
    name: db
    labels:
        app: db
spec:
    ports:
        - port: 5432
          protocol: TCP
          target: 5432
    selector:
        app: db
    type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
    name: queue
    labels:
        app: queue
spec:
    ports:
        - port: 4222
          protocol: TCP
    selector:
        app: queue
    type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
    name: cache
    labels:
        app: cache
spec:
    ports:
        - port: 6379
          protocol: TCP
    selector:
        app: cache
    type: ClusterIP
```

补充一个 `middleware.yaml`

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
    name: https-redirect-scheme
spec:
    redirectScheme:
        permanent: true
        scheme: https
```

接着是是 `ingressroute.yaml`

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
    name: redirect-to-https
spec:
    entryPoints:
        - web
    routes:
        - match: Host(`ctf.e23.dev`) # 改为自己的域名
          kind: Rule
          middlewares:
              - name: https-redirect-scheme # 这里使用了中间件，可以将 HTTP 跳转到 HTTPS
          services:
              - name: backend
                port: 8888

---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
    name: backend
spec:
    entryPoints:
        - websecure
    routes:
        - match: Host(`ctf.e23.dev`) # 改为自己的域名
          kind: Rule
          services:
              - name: backend
                port: 8888
    tls:
        secretName: cdsctf-cert-prod # 这里是假如我已经设置了一个 cert-manager 的 Certificate，那我就这么写
```

然后就是比较基本的 Helm 使用方法了，这里不详细描述。

但是还需要补充一点，就是 Traefik 可能没法正确处理 XFF 等请求头，导致 CdsCTF 无法正确解析客户端的真实 IP，这里提供一个方法，帮助你解决这个问题，如果你是 Helm 部署的 Traefik 的话，可以在 `values.yaml` 中这么写。

```yaml
service:
    spec:
        externalTrafficPolicy: Local

deployment:
    kind: DaemonSet

additionalArguments:
    - "--entryPoints.web.proxyProtocol.insecure"
    - "--entryPoints.web.forwardedHeaders.insecure"
    - "--entryPoints.websecure.proxyProtocol.insecure"
    - "--entryPoints.websecure.forwardedHeaders.insecure"
```
