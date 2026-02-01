# Configuration

CdsCTF supports two configuration methods: **environment variables** (recommended) and **config file**. Environment variables take precedence over the config file when both are set.

> [!TIP] Prefer environment variables for deployment — they are easier to manage in containers and CI/CD, and avoid committing secrets to config files.

## Environment Variables

All configuration can be set via environment variables with the prefix `CDSCTF_`. Nested keys use double underscores `__`.

Examples:

- `CDSCTF_SERVER__HOST=0.0.0.0`
- `CDSCTF_DB__HOST=db`
- `CDSCTF_DB__PASSWORD=your_password`
- `CDSCTF_OBSERVE__LOGGER__LEVEL=info`
- `CDSCTF_OBSERVE__EXPORTER__ENABLED=true`
- `CDSCTF_CLUSTER__TRAFFIC=proxy`

## Config File

The config file is optional. If present, it is loaded from the first path that exists:

1. `/etc/cdsctf/config.toml`
2. `~/.config/cdsctf/config.toml`
3. `./config/config.toml`
4. `./data/config/config.toml`

> [!IMPORTANT] After changing the config file or environment variables, restart the CdsCTF instance for changes to take effect.

Example `config.toml`:

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
path = "./data/media"

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

To get node names (for reference when using `public_entry`):

```bash
kubectl get nodes -o wide
```

## `media`

Local media storage path (e.g. uploads).

| Field | Description |
|-------|-------------|
| `path` | Directory path (default: `./data/media`) |

## `observe`

Observability: logging and OTLP exporter.

| Field | Description |
|-------|-------------|
| `service_name` | Service name for traces/logs (default: `cdsctf`) |
| `logger.level` | Log level (default: `info`) |
| `exporter.enabled` | Enable OTLP exporter (default: `false`) |
| `exporter.endpoint` | OTLP endpoint (optional) |
| `exporter.metric_endpoint` | Metrics endpoint (optional) |
| `exporter.log_endpoint` | Logs endpoint (optional) |
| `exporter.trace_endpoint` | Traces endpoint (optional) |

## Admin configuration

In addition to the runtime config above, the following are configured in the **admin panel** and stored in the database:

- **Captcha**: hCaptcha, Cloudflare Turnstile, or built-in image/POW captcha, plus difficulty and related options
- **Email**: SMTP and templates (e.g. verification, password reset)
- **Site logo**: Logo image used on the frontend

These are not set in `config.toml`; configure them in the admin UI after deployment.
