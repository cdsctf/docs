# Requirements

Before deploying CdsCTF, you need the following components. Version suggestions align with the Compose examples in [Quick Start](../deployment/quick-start) and [Docker + K3s](../deployment/docker-k3s).

## Required

| Component | Purpose | Suggested version |
|-----------|---------|-------------------|
| **PostgreSQL** | Primary database, accessed via SeaORM | 18+ (e.g. `postgres:18-alpine`) |
| **Valkey / Redis** | Cache and sessions, accessed via fred.rs | Valkey 9 or Redis 6–compatible |
| **NATS** | Message queue between components; JetStream required | NATS 2 (e.g. `nats:2-alpine` with `--js --sd=/data`) |
| **Kubernetes** | Orchestration for dynamic challenge environments | K3s recommended; see [Quick Start](../deployment/quick-start) |

## Optional

| Component | Purpose |
|-----------|---------|
| **OpenTelemetry Collector** | Receives OTLP data (metrics, traces, logs) from CdsCTF; see [Observability](../derivative/observability) |

## By deployment type

- **Docker + K3s**: Host needs Docker CE and Docker Compose; K3s can run on the same or another machine to provide challenge environments.
- **K3s only**: Only a K3s cluster (single-node is fine); CdsCTF and dependencies (PostgreSQL, Valkey, NATS, etc.) all run inside the cluster; see [K3s Only](../deployment/k3s-only).

Runtime configuration (database, cache, queue, cluster, etc.) is documented in [Configuration](../deployment/config).
