# 技术栈

## 后端

### 核心语言与框架

- Rust：高性能的内存安全语言
- Axum：一种基于 Tokio 的 Rust Web 框架

### 数据库与存储

- PostgreSQL：持久型数据库，通过 SeaORM 进行交互
- Valkey：用于缓存，通过 fred.rs 访问

### 消息队列与异步处理

- NATS：用于组件间通信的轻量级消息队列

### 容器与编排

- Kubernetes：用于管理题目的动态环境，使用 kube-rs 交互

### 安全与认证

- Argon2：用于密码哈希
- Ring & Rustls：提供加密功能

### 脚本引擎

- Rune：安全的嵌入式脚本语言，用于题目检查器

### 监控与日志

- OpenTelemetry：用于分布式追踪和监控
- Tracing：用于结构化日志记录

## 前端

### 核心框架与语言

- React：用于构建用户界面
- TypeScript：用于类型安全的 JavaScript 开发

### 构建工具

- Vite：现代化的前端构建工具

### UI 组件与样式

- Tailwind CSS：实用优先的 CSS 框架
- Radix UI：无样式、可访问的 UI 组件
- Lucide React：图标库

### 状态管理与数据获取

- Zustand：轻量级状态管理库
- Ky：基于 Fetch 的网络请求库
- TanStack Query：服务端数据状态管理与缓存库

### 表单处理与验证

- React Hook Form：表单处理库
- Zod：类型验证库

### 国际化与本地化

- i18next：国际化框架

### 图表与可视化

- Recharts：基于 React 的图表库
