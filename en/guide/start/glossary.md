# Glossary

| Term | Description |
|------|-------------|
| **Challenge** | A single CTF task; may include attachments, dynamic environments, and checker scripts. Managed independently from games. |
| **Game** | A time-bound competition that references a set of challenges; may have freeze time, ranking rewards, and dynamic scoring. |
| **Submission** | A user or team’s submitted flag or answer for a challenge. |
| **Checker** | Logic that determines whether a submission is correct; in CdsCTF this is implemented with Rune scripts. |
| **Dynamic environment** | A container environment allocated for a challenge via Kubernetes; dynamic flags can be injected via environment variables. |
| **Traffic (cluster.traffic)** | `expose`: challenge ports are exposed via NodePort; `proxy`: access is via a proxy such as WebSocketReflectorX. |
| **OTLP** | OpenTelemetry protocol used to send metrics, traces, and logs to a Collector. |
