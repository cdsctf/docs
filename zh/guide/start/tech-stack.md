# 技术栈

## 中间件

CdsCTF 需要依赖多个中间件，以提供稳定的服务。那这意味着需要为宿主机配置这些中间件吗？并非如此，我们可以使用 Docker Compose 或者 K3s 通过镜像创建这些中间件，并且妥当处理中间件与 CdsCTF 之间的关系。

| 中间件                                                              | 功能             |
| :------------------------------------------------------------------ | :--------------- |
| [PostgreSQL](https://www.postgresql.org/)                           | 数据持久化       |
| [NATS](https://nats.io/)                                            | 消息队列         |
| [Valkey](https://valkey.io/)                                        | 缓存             |
| [Kubernetes](https://kubernetes.io/)                                | 虚拟化与容器编排 |
| [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) | 遥测             |
