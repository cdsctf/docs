# Configuration

CdsCTF supports two configuration methods: **environment variables** (recommended) and **config file**. Environment variables take precedence over the config file when both are set.

> [!TIP] Deployment tip
> Prefer environment variables for deployment: they are easier to manage in containers and CI/CD, and avoid committing secrets to config files.

## Config reference

| Block | Description |
|-------|-------------|
| [server](#server) | HTTP server and frontend |
| [db](#db) | PostgreSQL database |
| [queue](#queue) | NATS message queue |
| [cache](#cache) | Valkey/Redis cache |
| [cluster](#cluster) | Kubernetes challenge environments |
| [media](#media) | Media storage (S3-compatible) |
| [observe](#observe) | Logging and OTLP observability |

## Environment Variables

All configuration can be set via environment variables with the prefix `CDSCTF_`. Nested keys use double underscores `__`.

Example:

```bash
CDSCTF_SERVER__HOST=0.0.0.0
CDSCTF_DB__HOST=db
CDSCTF_DB__PASSWORD=your_password
CDSCTF_OBSERVE__LOGGER__LEVEL=info
CDSCTF_OBSERVE__EXPORTER__ENABLED=true
CDSCTF_CLUSTER__TRAFFIC=proxy
CDSCTF_MEDIA__ENDPOINT=http://media:9000
CDSCTF_MEDIA__BUCKET=cdsctf
```

## Config File

The config file is **optional**. If present, it is loaded from the **first path that exists**:

1. `/etc/cdsctf/config.toml`
2. `~/.config/cdsctf/config.toml`
3. `./config/config.toml`
4. `./data/config/config.toml`

> [!IMPORTANT] Taking effect
> After changing the config file or environment variables, **restart the CdsCTF instance** for changes to take effect.

Full example `config.toml`:

```toml
[server]
host = "0.0.0.0"
port = 8888
frontend = "./dist"
cors_origins = "*"

[server.rate_limit]
enabled = true
burst_restore_rate = 100
burst_size = 512

[media]
endpoint = "http://media:9000"
region = "us-east-1"
bucket = "cdsctf"
access_key = "rustfsadmin"
secret_key = "rustfsadmin"
prefix = ""
path_style = true
presigned = false
# presigned_endpoint = "https://media.example.com"  # optional; used when generating presigned URLs

[observe]
service_name = "cdsctf"

[observe.logger]
level = "info"

[observe.exporter]
enabled = false
# endpoint = "http://telemetry:4317"
# metric_endpoint = "..."
# log_endpoint = "..."
# trace_endpoint = "..."

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
public_entry = "0.0.0.0"
egress_excluded_cidrs = []

# For traffic = "expose", set public_entry to the node's public IP or hostname.
# egress_excluded_cidrs: CIDRs to exclude from egress (optional).
```

## `server`

HTTP server and frontend.

| Field | Description |
|-------|-------------|
| `host` | Bind address (default: `0.0.0.0`) |
| `port` | Port (default: `8888`) |
| `frontend` | Path to frontend static files (default: `./dist`) |
| `cors_origins` | CORS allowed origins (default: `*`) |
| `rate_limit.enabled` | Enable rate limiting (default: `true`) |
| `rate_limit.burst_restore_rate` | Tokens restored per second (default: `100`) |
| `rate_limit.burst_size` | Max burst size (default: `512`) |

## `db`

PostgreSQL database connection.

| Field | Description |
|-------|-------------|
| `host` | Database host |
| `port` | Port (default: `5432`) |
| `dbname` | Database name |
| `username` | Username |
| `password` | Password |
| `ssl_mode` | SSL mode (e.g. `disable`) |

## `queue`

NATS message queue.

| Field | Description |
|-------|-------------|
| `host` | NATS host |
| `port` | Port (default: `4222`) |
| `username` | Optional username |
| `password` | Optional password |
| `token` | Optional auth token |
| `tls` | Use TLS (default: `false`) |

## `cache`

Valkey (Redis-compatible) cache.

| Field | Description |
|-------|-------------|
| `url` | Connection URL (e.g. `redis://cache:6379`) |

## `cluster`

Kubernetes cluster for dynamic challenge environments.

| Field | Description |
|-------|-------------|
| `namespace` | Namespace for challenge resources (default: `cdsctf-challenges`). For K3s-only deployment, do not confuse this with the namespace where CdsCTF runs. |
| `auto_infer` | Auto-infer kubeconfig (default: `true`), often used in K3s-only setups. |
| `config_path` | Path to kubeconfig file (e.g. `~/.kube/config`). |
| `traffic` | `expose` \| `proxy`. With `expose`, challenges expose ports via NodePort and `public_entry` is used. With `proxy`, access is via [WebSocketReflectorX](https://github.com/XDSEC/WebSocketReflectorX). |
| `public_entry` | Public IP or hostname of the node (used when `traffic = "expose"`). |
| `egress_excluded_cidrs` | Optional list of CIDRs to exclude from egress. |

When setting `public_entry`, you can list node names and addresses with:

```bash
kubectl get nodes -o wide
```

## `media`

Media storage is **RustFS** by default (S3-compatible). Used for uploads such as challenge attachments and logos. Prefer an internal endpoint URL to save egress.

| Field | Description |
|-------|-------------|
| `endpoint` | RustFS or other S3-compatible server endpoint (default: `http://media:9000`) |
| `region` | Region (default: `us-east-1`) |
| `bucket` | Bucket name (default: `cdsctf`) |
| `access_key` | Access key |
| `secret_key` | Secret key |
| `prefix` | Optional key prefix (default: empty) |
| `path_style` | Use path-style URLs (default: `true`) |
| `presigned` | Use presigned URLs for client access (default: `false`) |
| `presigned_endpoint` | Optional. When set, presigned URLs use this endpoint (typically a public URL); otherwise the same as `endpoint`. |

## `observe`

Observability: logging and OTLP exporter. Telemetry facilities (e.g. OpenTelemetry Collector) are not provided with Compose or the Helm Chart; deploy them yourself, then set the endpoint in config.

| Field | Description |
|-------|-------------|
| `service_name` | Service name for traces/logs (default: `cdsctf`) |
| `logger.level` | Log level (default: `info`) |
| `exporter.enabled` | Enable OTLP exporter (default: `false`) |
| `exporter.endpoint` | OTLP endpoint (optional) |
| `exporter.metric_endpoint` | Metrics endpoint (optional) |
| `exporter.log_endpoint` | Logs endpoint (optional) |
| `exporter.trace_endpoint` | Traces endpoint (optional) |
