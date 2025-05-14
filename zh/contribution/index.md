# 快速上手

## 开发环境

在保证你可以按照文章 _开始/部署_ 的指引正确部署 CdsCTF 时，可以按照以下指引建立 CdsCTF 的开发环境。

### Rust 工具链

请参照 [Rust 官方文档](https://www.rust-lang.org/zh-CN/learn/get-started) 安装最新版本的 Rust 及衍生工具。

### Node.js 工具链

请参照 [Node.js 官方文档](https://nodejs.org/zh-cn/download/) 安装最新版本的 Node.js 及衍生工具（尤其是 pnpm）。

先克隆仓库，或者可以先复刻再克隆

```bash
git clone https://github.com/cdsctf/cdsctf.git
```

使用 Docker Compose 运行开发时的依赖服务（数据库、消息队列、缓存、遥测）

```yaml
services:
    db:
        image: postgres:alpine
        restart: always
        environment:
            POSTGRES_USER: cdsctf
            POSTGRES_PASSWORD: cdsctf
            POSTGRES_DB: cdsctf
        volumes:
            - "db:/var/lib/postgresql/data"
        ports:
            - "5432:5432"

    queue:
        image: nats:alpine
        restart: always
        command:
            - "--js"
            - "--sd=/data"
        volumes:
            - "queue:/data"
        ports:
            - "4222:4222"

    cache:
        image: valkey/valkey:alpine
        restart: always
        volumes:
            - "cache:/data"
        ports:
            - "6379:6379"

    telemetry:
        image: otel/opentelemetry-collector:latest
        ports:
            - "4317:4317"
            - "4318:4318"
            - "2345:2345"
        volumes:
            - "./otel-config.yml:/otel-config.yml:ro"
        command: ["--config", "/otel-config.yml"]
        restart: unless-stopped
volumes:
    db:
    queue:
    cache:
```

### 使用 Cargo 编译/运行后端

```bash
cargo build
```

你可以使用这条命令运行后端（在此之前请务必在目录中准备好符合要求的配置文件）

```bash
cargo run --bin cds-server
```

> [!TIP]
>
> 如果你在使用 Windows 进行开发时，遇到无法编译 `aws-lc-sys` 的问题，可以尝试一下：
>
> 1. 安装 [CMake](https://cmake.org/download/)
> 2. 安装 [NASM](https://www.nasm.us/)
> 3. 安装 [Clang](https://clang.llvm.org/)
>
> 并且需要保证 `CMake`、`NASM`、`Clang` 的路径都在 `PATH` 环境变量中。

### 使用 Node.js 编译/运行前端

```bash
cd web
```

CdsCTF 推荐使用 PNPM 以代替 NPM 进行开发，先安装依赖：

```bash
pnpm install
```

然后可以运行：

```bash
pnpm dev
```

> [!TIP]
>
> 你可以在前端目录中创建一个 `.env` 文件，用来覆盖传至前端项目中的环境变量，此功能在需要临时使用其他来源的后端 API 时尤为重要。
