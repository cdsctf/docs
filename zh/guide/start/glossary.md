# 术语表

| 术语 | 说明 |
|------|------|
| **题目 (Challenge)** | 一道 CTF 题，可包含附件、动态环境、检查器脚本等；与比赛分离管理。 |
| **比赛 (Game)** | 一场限时竞赛，引用若干题目，可有冻结时间、排名奖励、动态分值等。 |
| **提交 (Submission)** | 用户/队伍对某题提交的 flag 或答案。 |
| **检查器 (Checker)** | 判定提交是否正确的逻辑，CdsCTF 使用 Rune 脚本实现。 |
| **动态环境** | 为题目分配的容器环境，通过 Kubernetes 创建，可将动态 flag 经环境变量下发。 |
| **流量模式 (traffic)** | `cluster.traffic`：`expose` 表示题目端口经 NodePort 暴露；`proxy` 表示经 WebSocketReflectorX 等代理访问。 |
| **OTLP** | OpenTelemetry 的协议，用于向 Collector 发送指标、追踪与日志。 |
