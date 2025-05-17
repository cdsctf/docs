# Configuration

The `config.toml` file is required to run the CdsCTF core service. It provides environment configuration for various middleware services used by CdsCTF. This section will explain each field in detail.

> [!IMPORTANT] Please note that after modifying config.toml, you must restart the CdsCTF instance for the changes to take effect.

```toml
[server]
host = "0.0.0.0"
port = 8888
frontend = "./dist"

[media]
path = "./data/media"

[logger]
level = "info,sqlx=debug,sea_orm=debug,cds_web=debug"

[db]
host = "db"
port = 5432
dbname = "cdsctf"
username = "cdsctf"
password = "cdsctf"
ssl_mode = "disable"

[queue]
host = "queue"
port = 4222
username = ""
password = ""
token = ""
tls = false

[cache]
url = "redis://cache:6379"

[cluster]
namespace = "cdsctf-challenges"
auto_infer = true
config_path = "~/.kube/config"
traffic = "proxy"

[cluster.public_entries]
"ubuntu" = "127.0.0.1"

[telemetry]
is_enabled = false
protocol = "grpc"
endpoint_url = "http://telemetry:4317"

[jwt]
secret = "A_R4ND0M_4TR1NG"
expiration = 43200
```

## `db`

Configuration for the PostgreSQL database.

## `queue`

Configuration for the NATS message queue.

## `cache`

Configuration for the Valkey cache.

## `cluster`

Configuration for Kubernetes.

### `namespace`

A string value. All resources related to dynamic challenge environments will reside in this namespace. If you're using the K3s-only deployment method, make sure not to confuse this with the namespace used for running CdsCTF itself.

### `auto_infer`

A boolean. Enables automatic inference of the Kubernetes configuration file — commonly used in K3s-only deployments.

### `config_path`

A string. Specifies the path to the Kubernetes configuration file.

### `traffic`

A string: `expose` | `proxy`.

- If set to `expose`, the `public_entries` section must be configured, and all dynamic challenge environments will expose ports via Kubernetes NodePort services.
- If set to `proxy`, challenge environments will be accessed through [WebsocketReflectorX](https://github.com/XDSEC/WebSocketReflectorX).

### `public_entries`

A map of strings to strings. Typically defines the mapping between Kubernetes node names and their corresponding public access points (IP addresses or domains).

You can get the node names using the following command:

```bash
kubectl get nodes -o wide
```

Usually, the current machine's node name is the lowercase version of its hostname.
