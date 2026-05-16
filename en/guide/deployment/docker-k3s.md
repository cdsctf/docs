# Docker + K3s

Let's start by explaining the relationship. In this deployment method, CdsCTF and its middleware (excluding Kubernetes) all run within Docker, while Kubernetes is used solely to provide dynamic challenge environments for CdsCTF.

You'll need to install Docker CE—and no, it's not as simple as running apt-get install docker.

To install Docker CE, follow the [official documentation](https://docs.docker.com/engine/install/).

Once that's done, Docker is fully installed.

Managing multiple middleware components using standalone Docker commands can get cumbersome. That's why we use Docker Compose.

Start by creating an empty directory, and then add a `compose.yml` file to define the images and dependencies for CdsCTF and its middleware.

> [!NOTE]
> Telemetry facilities (e.g. OpenTelemetry Collector) are **not** provided with this Compose. If you need observability, see [Observability](../derivative/observability) and deploy a Collector and backends yourself.

```yaml
services:
  server:
    image: docker.io/elabosak233/cdsctf:1.10
    ports:
      - "127.0.0.1:8888:8888"
    restart: always
    depends_on:
      - db
      - queue
      - cache
      - media

  db:
    image: docker.io/library/postgres:18-alpine
    restart: always
    environment:
      POSTGRES_USER: cdsctf
      POSTGRES_PASSWORD: cdsctf
      POSTGRES_DB: cdsctf
    volumes:
      - "db:/var/lib/postgresql/18/docker"

  queue:
    image: docker.io/library/nats:2-alpine
    restart: always
    command:
      - "--js"
      - "--sd=/data"
    volumes:
      - "queue:/data"

  cache:
    image: docker.io/valkey/valkey:9-alpine
    restart: always
    volumes:
      - "cache:/data"

  media:
    image: rustfs/rustfs:latest
    restart: unless-stopped
    volumes:
      - media:/data

volumes:
  server:
  db:
  queue:
  cache:
  media:
```

If this Compose file seems overwhelming, don't hesitate to ask an LLM for help.

No custom network is defined here; Compose will use the default network. Services can reach each other by service name (e.g. `db`, `queue`, `cache`).

After that, in the same directory:

1. Create a `configs` folder – this will be mounted into the server container at `/etc/cdsctf` and hold CdsCTF's config.toml.
2. Add a `config.toml` file to the `configs` directory, containing your service configuration.
3. Add a `k8s.yml` file – this file holds credentials for connecting to the K8s control plane. You can obtain it via:

```bash
cat /etc/rancher/k3s/k3s.yaml
```

Save the output to `k8s.yml`.

Update your `config.toml` to use Docker service names (like db, queue, cache) instead of IPs for host values. Docker Compose allows services to reach each other using these names as hostnames.

Next, edit your `k8s.yml`. It may look like this initially:

```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: ...
      server: https://127.0.0.1:6443
    name: default
# ...
```

CdsCTF's server runs inside a container and must reach the host's K3s API via the **gateway** of the Compose default network, not `127.0.0.1`.

To get the gateway IP, run:

```bash
docker network inspect <network_name>
```

The default Compose network is usually named after the project directory plus `_default` (e.g. `cdsctf_default` for a directory named `cdsctf`). In the command output, find `IPAM` → `Config` → `Gateway`; that value is the gateway IP (e.g. `172.18.0.1`). Update `k8s.yml` so `server` is `https://<gateway_IP>:6443`, for example:

```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: ...
      server: https://172.18.0.1:6443
    name: default
# ...
```

If you run `docker compose up` and see errors related to connecting to the Kubernetes cluster, you may need to reconfigure K3s certificates. See the Q&A section for guidance.

If successful, visiting `http://127.0.0.1:8888` will reach CdsCTF. If you use `http://127.0.0.1` (ports 80/443), you may get `404 page not found` from K3s's Traefik. You can reconfigure Traefik; see Q&A for details.

Once resolved, run: `docker compose up -d` and CdsCTF should start successfully.
