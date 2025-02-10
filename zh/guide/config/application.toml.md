# `application.toml`

`application.toml` 是运行 CdsCTF 必需的文件。这里将详解每一个字段。

这里先给一个示例文件

```toml
[meta]
title = "CdsCTF"
description = "Reality is an illusion, the universe is a hologram."
logo_path = "./data/media/logo.webp"

[auth]
secret = "a_random_string"
expiration = 1800

[auth.register]
is_enabled = true

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
namespace = "cdsctf"
kube_config_path = "./k8s-config.yml"
traffic = "expose"

[cluster.public_entries]
"docker" = "127.0.0.1"

[cluster.capture]
is_enabled = false
path = "./data/captures"

[media]
path = "./data/media"

[email]
is_enabled = false
host = "smtp.cdsctf.dev"
port = 465
tls = "tls"
username = "noreply@cdsctf.dev"
password = "p455w0rd"
sender = "CdsCTF"
whitelist = []

[email.template]
verification = { subject = "Email Verification", body = "#{code}" }
password_reset = { subject = "Password Reset", body = "#{code}" }

[captcha]
provider = "pow"
difficulty = 4

[captcha.turnstile]
url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
secret_key = "secret_key"
site_key = "site_key"

[captcha.hcaptcha]
url = "https://api.hcaptcha.com/siteverify"
secret_key = "secret_key"
site_key = "site_key"
score = 80

[logger]
level = "info,sqlx=debug,sea_orm=debug,cds_web=debug,cds_captcha=debug"

[telemetry]
is_enabled = false
protocol = "grpc"
endpoint_url = "http://telemetry:4317"

[server]
host = "0.0.0.0"
port = 8888
```

## `meta`

记录 CdsCTF 的元数据，控制网站的标题、描述、Logo 等。

### `title`

字符串。网站标题。

### `description`

字符串。网站描述。

### `logo_path`

字符串。网站 Logo 的本地地址。

## `auth`

登录、鉴权模块所需的配置。

### `secret`

字符串。应当为一个随机值。用于生成 JWT Token。

### `expiration`

整数。JWT Token 的有效时长。（分钟为单位）

## `db`

PostgreSQL 数据库相关配置。

## `queue`

NATS 消息队列相关配置。

## `cache`

Valkey 缓存相关配置。

## `cluster`

Kubernetes 相关配置。

### `namespace`

字符串。所有与题目动态环境相关的资源全部存在于此命名空间下。

### `kube_config_path`

Kubernetes 控制平面的连接配置文件地址。

### `traffic`

字符串 `expose` | `proxy`。若选择 `expose`，则下文的 `public_entries` 一定需要配置，所有的题目动态环境都将通过 Kubernetes 的 NodePort Service 暴露端口。若为 `proxy`，则题目动态环境需要通过 [WebsocketReflectorX](https://github.com/XDSEC/WebSocketReflectorX) 访问，并且仅使用 `proxy` 时，允许对流量进行捕获。

### `public_entries`

键值对，字符串对字符串。这里通常记录的是 Kubernetes Node 名及其对应的公网入口。

你可以通过以下命令获得 Node 名：

```bash
kubectl get nodes -o wide
```

但通常，当前机器的 Node 名就是主机名转小写。

### `capture`

流量捕获功能的配置。

#### `is_enabled`

布尔值。是否启用流量捕获（仅在 `cluster.traffic = "proxy"` 时有效）。