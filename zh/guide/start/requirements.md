# 前置要求

部署 CdsCTF 前，需要准备以下组件。版本建议以 [快速开始](../deployment/quick-start) 与 [Docker + K3s](../deployment/docker-k3s) 中的 Compose 为参考。

## 必选组件

| 组件 | 用途 | 建议版本 |
|------|------|----------|
| **PostgreSQL** | 主数据库，经 SeaORM 访问 | 18+（如 `postgres:18-alpine`） |
| **Valkey / Redis** | 缓存与会话，经 fred.rs 访问 | Valkey 9 或兼容 Redis 6+ |
| **NATS** | 组件间消息队列，需启用 JetStream | NATS 2（如 `nats:2-alpine`，带 `--js --sd=/data`） |
| **Kubernetes** | 题目动态环境（容器）编排 | 推荐 K3s，见 [快速开始](../deployment/quick-start) |

## 可选组件

| 组件 | 用途 |
|------|------|
| **OpenTelemetry Collector** | 接收 CdsCTF 的 OTLP 数据（Metric / Trace / Log），见 [可观测性](../derivative/telemetry) |

## 部署方式与要求

- **Docker + K3s**：宿主机需安装 Docker CE 与 Docker Compose；K3s 可装在同一台或另一台机器，用于提供题目环境。
- **仅 K3s**：只需 K3s 集群（可单节点），CdsCTF 及依赖（PostgreSQL、Valkey、NATS 等）均部署在集群内，见 [仅 K3s](../deployment/k3s-only)。

所有运行期配置（数据库连接、缓存、队列、集群等）见 [配置文件](../deployment/config)。
