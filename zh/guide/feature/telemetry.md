# 遥测

CdsCTF 中使用 OpenTelemetry SDK 并通过 OTLP 与 OpenTelemetry Collector 连接，并向其发送 Metric、Trace 和 Log。随后再由 Collector 将数据分发给相应的后端（如 Prometheus、Jaeger 和 Loki）。

> [!TIP]
>
> 请问什么时候需要使用遥测，使用遥测的好处是什么？
>
> 任何时候都可以使用遥测。虽然在示例配置文件中，遥测是关闭的，但是 CdsCTF 推荐使用遥测来监控应用状态，并配合 Loki 等实现日志持久化，配合 Jaeger 等实现分布式追踪。

本文将教你如何配置一个相对完整的 CdsCTF 遥测系统。

CdsCTF 推荐使用的数据可视化服务为 [Grafana](https://grafana.com/)，不用担心，仍然可以通过 Docker 自由部署。但是如果运行 CdsCTF 的服务器性能受限，那就并不推荐在同一台宿主机上部署 Grafana。另外，这里只教部署，Grafana 的具体使用可以通过互联网了解。

根据上文和 CdsCTF 的 `application.toml` 配置文件可知，`telemetry.endpoint_url` 字段填写的是 OpenTelemetry Collector 的地址。所以我们还需要一个 OpenTelemetry Collector。

然后，处理三种数据的后端也是不一样的。在本篇文章中我们使用 Prometheus 处理 Metric，使用 Jaeger 处理 Trace，使用 Loki 处理 Log。

所以，想要完整的遥测，需要 5 个服务。

接下来会有两个 `compose.yml`，规划以上提到的 5 个服务。

这里的服务是 Loki、Jaeger 和 OpenTelemetry Collector。需要被部署在 CdsCTF 后端能够访问到的服务器上。

```yaml
version: "3.8"

services:
  loki:  # Logs collection
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    restart: unless-stopped
      
  jaeger:  # Traces collection
    image: jaegertracing/jaeger:latest
    ports:
      # - "6831:6831/udp" # UDP port for Jaeger agent
      - "16686:16686" # Web UI
    restart: unless-stopped

  otel-collector:  # Observability data pipeline
    image: otel/opentelemetry-collector:latest
    ports:
      - "4317:4317"  # Grpc receive port
      - "4318:4318"  # Http receive port
      - "2345:2345"  # Metrics preview
    volumes:
      - ./otel-config.yml:/otel-config.yml:ro
    command: ["--config", "/otel-config.yml"]
    restart: unless-stopped
```

这里的服务是 Grafana 和 Prometheus。只要部署在能访问到上面三者的环境中即可。

```yaml
version: "3.8"

services:
  grafana:  # Data visualization
    image: grafana/grafana:latest
    ports:
      - "3000:3000"  # Grafana default port
    volumes:
      - grafana:/var/lib/grafana
      # - ./grafana.ini:/etc/grafana/grafana.ini
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped

  prometheus:  # Metrics collection
    image: prom/prometheus:latest
    ports:
      - "9090:9090"  # Prometheus default web UI port
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
    restart: unless-stopped

volumes:
  grafana:
```

> [!TIP]
>
> 为什么同样为数据处理，管理 Metric 的 Prometheus 与其他二者（Jaeger 和 Loki）所部署的位置不同？
>
> OpenTelemetry Collector 会将收集到的 Trace 和 Log 数据主动发送给 Jaeger 和 Loki（就像 CdsCTF 把所有数据主动发送给 OpenTelemetry Collector 一样）。而 Prometheus 在处理 Metric 数据通常都是由 Prometheus 主动向 OpenTelemetry Collector 抓取，所以 OpenTelemetry 会暴露一个 `/metric` 路由供环境外的 Prometheus 使用。

你可能还需要两个配置文件供 Prometheus 和 Opentelemetry Collector 使用：

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "otel-collector"
    static_configs:
      - targets: ["otel-collector:2345"]
```

```yaml
# otel-config.yml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
      http:
        endpoint: "0.0.0.0:4318"

exporters:
  debug:
    verbosity: "detailed"

  prometheus:
    endpoint: "0.0.0.0:2345"  # For Prometheus to collect Collector metrics
    namespace: "otel"
  
  otlphttp/loki:
    endpoint: "http://loki:3100/otlp"
  
  otlp/jaeger:
    endpoint: "http://jaeger:4317"
    tls:
      insecure: true

processors:
  batch:

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, otlphttp/loki]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

将两个文件放到相应的 Compose 目录，两边运行 `docker compose up` 即可。