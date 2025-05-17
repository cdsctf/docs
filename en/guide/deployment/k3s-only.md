# K3s Only

In this deployment method, you only need K3s. However, this guide will not teach you how to set up a K3s cluster. Instead, it will demonstrate how to deploy CdsCTF and its related services on a single-node K3s instance.

Before you begin, you might want to prepare [Helm](https://helm.sh/). Don't get too excited — CdsCTF doesn't yet have a generic Helm Chart. I just find Helm makes deployment a bit easier.

If you can't use the `helm` command properly, try running this command first:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Then, create an empty directory and let's get started.

First, create a `Chart.yaml` file with the following content — just enough for Helm to recognize it as a Chart. You don't need to follow this exactly. The default namespace assumed during deployment will be `cdsctf`.

```yaml
apiVersion: v2
name: cdsctf
description: A Helm chart to deploy CdsCTF on Kubernetes.
type: application
version: 1.0.0
```

Next, create a `templates` directory — most of the files will go here.

Create a `serviceaccount.yaml` file to provide CdsCTF with a service account for cluster access:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cdsctf-sa
```

Now create a ClusterRoleBinding to grant `cdsctf-sa` permissions. This doesn't have to be managed by Helm, so you can apply it separately:

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
    namespace: cdsctf # Don't forget to update the namespace
```

Now create deployment.yaml:

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
      serviceAccountName: cdsctf-sa # Give ServiceAccount
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

Next is `pv.yaml`. This depends on your setup, since not everyone needs to map to a specific directory. Modify accordingly:

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

Since we have PersistentVolumes, we'll need PersistentVolumeClaims. Here's `pvc.yaml`:

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

Next is `configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  config.toml: |
    # Fill in your CdsCTF config content here
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: telemetry-config
data:
  otel-config.yml: |
    # Fill in your OpenTelemetry Collector config here
```

The following configurations vary per setup. This example uses Traefik IngressRoute. First, `service.yaml`:

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

Then add a `middleware.yaml`:

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

Then `ingressroute.yaml`:

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: redirect-to-https
spec:
  entryPoints:
    - web
    - websecure
  routes:
    - match: Host(`ctf.e23.dev`) # 改为自己的域名
      kind: Rule
      services:
        - name: backend
          port: 8888
```

From here on, you can proceed with the basic Helm deployment workflow — not detailed here.

One last note: Traefik may not correctly handle X-Forwarded-For (XFF) and similar headers, which can prevent CdsCTF from resolving the real client IP. Here’s how to address that. If you deployed Traefik with Helm, add this to your `values.yaml`:

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
