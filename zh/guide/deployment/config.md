# 配置

CdsCTF 支持两种配置方式：**环境变量**（推荐）和 **配置文件**。当两者同时存在时，环境变量优先于配置文件。

> [!TIP] 部署建议
> 部署时优先使用环境变量：在容器和 CI/CD 中更易管理，且可避免将敏感信息写入配置文件。

## 配置项速览

| 配置块 | 说明 |
|--------|------|
| [server](#server) | HTTP 服务与前端 |
| [db](#db) | PostgreSQL 数据库 |
| [queue](#queue) | NATS 消息队列 |
| [cache](#cache) | Valkey/Redis 缓存 |
| [cluster](#cluster) | Kubernetes 题目环境 |
| [media](#media) | 媒体存储（S3 兼容） |
| [observe](#observe) | 日志与 OTLP 可观测性 |

## 环境变量

所有配置均可通过以 `CDSCTF_` 为前缀的环境变量设置；嵌套键使用双下划线 `__` 表示。

例如：

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

## 配置文件

配置文件为**可选**。若存在，则按以下路径顺序查找并加载**第一个存在**的文件：

1. `/etc/cdsctf/config.toml`
2. `~/.config/cdsctf/config.toml`
3. `./config/config.toml`
4. `./data/config/config.toml`

> [!IMPORTANT] 生效方式
> 修改配置文件或环境变量后，需**重启 CdsCTF 实例**才能使配置生效。

完整示例 `config.toml` 如下：

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
# presigned_endpoint = "https://media.example.com"  # 可选；生成预签名 URL 时使用

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

# 当 traffic = "expose" 时，将 public_entry 设为节点的公网 IP 或主机名。
# egress_excluded_cidrs: 可选，需要排除出站的 CIDR 列表。
```

## `server`

HTTP 服务与前端。

| 字段 | 说明 |
|------|------|
| `host` | 监听地址（默认：`0.0.0.0`） |
| `port` | 端口（默认：`8888`） |
| `frontend` | 前端静态资源路径（默认：`./dist`） |
| `cors_origins` | CORS 允许的来源（默认：`*`） |
| `rate_limit.enabled` | 是否启用限流（默认：`true`） |
| `rate_limit.burst_restore_rate` | 每秒恢复的令牌数（默认：`100`） |
| `rate_limit.burst_size` | 突发大小上限（默认：`512`） |

## `db`

PostgreSQL 数据库连接。

| 字段 | 说明 |
|------|------|
| `host` | 数据库主机 |
| `port` | 端口（默认：`5432`） |
| `dbname` | 数据库名 |
| `username` | 用户名 |
| `password` | 密码 |
| `ssl_mode` | SSL 模式（如 `disable`） |

## `queue`

NATS 消息队列。

| 字段 | 说明 |
|------|------|
| `host` | NATS 主机 |
| `port` | 端口（默认：`4222`） |
| `username` | 可选用户名 |
| `password` | 可选密码 |
| `token` | 可选认证 token |
| `tls` | 是否使用 TLS（默认：`false`） |

## `cache`

Valkey（兼容 Redis）缓存。

| 字段 | 说明 |
|------|------|
| `url` | 连接 URL（如 `redis://cache:6379`） |

## `cluster`

用于题目动态环境的 Kubernetes 集群。

| 字段 | 说明 |
|------|------|
| `namespace` | 题目相关资源所在命名空间（默认：`cdsctf-challenges`）。仅 K3s 部署时注意不要与运行 CdsCTF 的命名空间混淆。 |
| `auto_infer` | 是否自动推断 kubeconfig（默认：`true`），常用于仅 K3s 部署。 |
| `config_path` | kubeconfig 文件路径（如 `~/.kube/config`）。 |
| `traffic` | `expose` \| `proxy`。为 `expose` 时，题目通过 NodePort 暴露端口，需配置 `public_entry`；为 `proxy` 时通过 [WebSocketReflectorX](https://github.com/XDSEC/WebSocketReflectorX) 访问。 |
| `public_entry` | 节点的公网 IP 或主机名（在 `traffic = "expose"` 时使用）。 |
| `egress_excluded_cidrs` | 可选，需要排除出站的 CIDR 列表。 |

配置 `public_entry` 时，可先查看节点名与地址：

```bash
kubectl get nodes -o wide
```

## `media`

媒体存储默认使用 **RustFS**（兼容 S3），用于题目附件、Logo 等上传。建议使用内网 endpoint 以节省出口流量。

| 字段 | 说明 |
|------|------|
| `endpoint` | RustFS 或其他 S3 兼容服务端点（默认：`http://media:9000`） |
| `region` | 区域（默认：`us-east-1`） |
| `bucket` | 存储桶名称（默认：`cdsctf`） |
| `access_key` | 访问密钥 |
| `secret_key` | 私密密钥 |
| `prefix` | 可选的对象键前缀（默认：空） |
| `path_style` | 是否使用 path-style URL（默认：`true`） |
| `presigned` | 是否使用预签名 URL 供客户端访问（默认：`false`） |
| `presigned_endpoint` | 可选。设置后，预签名 URL 将使用该端点（通常为公网 URL）；否则与 `endpoint` 相同。 |

## `observe`

可观测性：日志与 OTLP 数据导出。可观测性设施（如 OpenTelemetry Collector）不随 Compose 或 Helm Chart 提供，需自行部署后再配置端点。

| 字段 | 说明 |
|------|------|
| `service_name` | 链路/日志中的服务名（默认：`cdsctf`） |
| `logger.level` | 日志级别（默认：`info`） |
| `exporter.enabled` | 是否启用 OTLP 导出（默认：`false`） |
| `exporter.endpoint` | OTLP 端点（可选） |
| `exporter.metric_endpoint` | 指标端点（可选） |
| `exporter.log_endpoint` | 日志端点（可选） |
| `exporter.trace_endpoint` | 链路端点（可选） |
