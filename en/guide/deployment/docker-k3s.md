# Docker + K3s

Let's start by explaining the relationship. In this deployment method, CdsCTF and its middleware (excluding Kubernetes) all run within Docker, while Kubernetes is used solely to provide dynamic challenge environments for CdsCTF.

You'll need to install Docker CE—and no, it's not as simple as running apt-get install docker.

To install Docker CE, follow the [official documentation](https://docs.docker.com/engine/install/).

Once that's done, Docker is fully installed.

Managing multiple middleware components using standalone Docker commands can get cumbersome. That's why we use Docker Compose.

Start by creating an empty directory, and then add a `compose.yml` file to define the images and dependencies for CdsCTF and its middleware:

```yaml
version: "3.0"
services:
  backend:
    image: elabosak233/cdsctf:latest
    ports:
      - "127.0.0.1:8888:8888"
    restart: always
    volumes:
      - "backend:/app/data"
      - "./configs:/etc/cdsctf"
    depends_on:
      - db
      - queue
      - cache
    networks:
      cdsnet:
        ipv4_address: "172.20.0.10"

  db:
    image: postgres:alpine
    restart: always
    environment:
      POSTGRES_USER: cdsctf
      POSTGRES_PASSWORD: cdsctf
      POSTGRES_DB: cdsctf
    volumes:
      - "db:/var/lib/postgresql/data"
    networks:
      cdsnet:

  queue:
    image: nats:alpine
    restart: always
    command:
      - "--js"
      - "--sd=/data"
    volumes:
      - "queue:/data"
    networks:
      cdsnet:

  cache:
    image: valkey/valkey:alpine
    restart: always
    volumes:
      - "cache:/data"
    networks:
      cdsnet:

  telemetry:
    image: otel/opentelemetry-collector:latest
    ports:
      - "127.0.0.1:2345:2345"
    volumes:
      - "./otel-config.yml:/otel-config.yml:ro"
    command: ["--config", "/otel-config.yml"]
    restart: unless-stopped
    networks:
      cdsnet:

volumes:
  backend:
  db:
  queue:
  cache:

networks:
  cdsnet:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: "172.20.0.0/24"
```

If this Compose file seems overwhelming, don't hesitate to ask an LLM for help.

In this configuration, we define a Docker network called `cdsnet` using the `172.20.0.0/24` subnet. All containers will receive an address within this range. The backend service is explicitly assigned `172.20.0.10`, but you're free to change these values as needed. Predefining the network helps with Kubernetes integration, as we'll see later.

After that, in the same directory:

1. Create a `/config` folder – this will be mounted into the backend container and hold CdsCTF's config.toml.
2. Add a `config.toml` file to the `/config` directory, containing your service configuration.
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

But for the backend container to access the K8s API, you'll need to change `127.0.0.1` to the Docker network gateway, typically `172.20.0.1`, resulting in:

```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: ...
      server: https://172.20.0.1:6443
    name: default
# ...
```

The reason: CdsCTF's backend runs inside Docker and cannot access services on the host via `127.0.0.1`.

If you run `docker compose up` and see errors related to connecting to the Kubernetes cluster, you may need to reconfigure K3s certificates. See the Q&A section for guidance.

If successful, visiting `http://127.0.0.1` may still show `404 page not found`. This likely comes from Traefik, K3s's default ingress controller. You can reconfigure Traefik. See Q&A for details.

Once resolved, run: `docker compose up -d` and CdsCTF should start successfully.
