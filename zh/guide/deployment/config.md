# 配置文件

`config.toml` 是运行 CdsCTF 核心服务的必需文件，它会向 CdsCTF 提供各大中间件的环境配置。这里将详解每一个字段。

> [!IMPORTANT] 请注意，在修改了 config.toml 之后，一定需要重启 CdsCTF 实例，配置才能生效。

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

PostgreSQL 数据库相关配置。

## `queue`

NATS 消息队列相关配置。

## `cache`

Valkey 缓存相关配置。

## `cluster`

Kubernetes 相关配置。

### `namespace`

字符串。所有与 **题目动态环境** 相关的资源全部存在于此命名空间下。换句话说，如果你是仅 K3s 部署的，不要和存放 CdsCTF 的命名空间搞混了！

### `auto_infer`

布尔值。自动推断 Kubernetes 的配置文件，通常用于仅 K3s 部署的方式。

### `config_path`

字符串。指向存放 Kubernetes 配置文件的位置。

### `traffic`

字符串 `expose` | `proxy`。若选择 `expose`，则下文的 `public_entries` 一定需要配置，所有的题目动态环境都将通过 Kubernetes 的 NodePort Service 暴露端口。若为 `proxy`，则题目动态环境需要通过 [WebsocketReflectorX](https://github.com/XDSEC/WebSocketReflectorX) 访问，并且仅使用 `proxy` 时，允许对流量进行捕获。

### `public_entries`

键值对，字符串对字符串。这里通常记录的是 Kubernetes Node 名及其对应的公网入口。

你可以通过以下命令获得 Node 名：

```bash
kubectl get nodes -o wide
```

但通常，当前机器的 Node 名就是主机名转小写。
