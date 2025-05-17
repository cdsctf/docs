# Quick Start

If you want to deploy a CdsCTF instance, it's not exactly an easy task — but I promise things will get simpler later on.

This _Quick Start_ guide doesn't directly walk you through a detailed deployment process. Instead, it helps you choose the deployment method that best fits your needs and provides some essential preliminary guidance.

It's clear that CdsCTF offers two recommended deployment methods: one is a **Docker + K3s** hybrid deployment, and the other is a **K3s Only** deployment. It may be a bit tricky to choose between them. Please note in advance: regardless of which method you choose, this guide does not cover SSL configuration.

## Deployment Method Comparison

### K3s Only Deployment

> [!TIP] Recommended Deployment Method
>
> This method is suitable for long-running sites, intended for long-term challenge storage or hosting large games.

In this deployment model, CdsCTF, the database, cache, and other infrastructure services — along with the dynamic challenge environments — all run within the K3s cluster. This allows full utilization of K3s's strengths and enables more reliable data monitoring. However, the learning curve is slightly higher.

### Docker + K3s Hybrid Deployment

> [!TIP] Minimal and Most Convenient Deployment
>
> This method is suitable for personal use of CdsCTF to store challenges or host small-scale games (including school-level events).

In this setup, CdsCTF, the database, cache, and related services run inside a single Docker instance, managed via Docker Compose. However, dynamic challenge environments run remotely on a K3s cluster. The key advantage here is that you won't need much knowledge of K3s, making it an accessible choice even for beginner-level sysadmins.

## Prerequisite Services

On most CTF platforms, Docker or Kubernetes is used to manage dynamic challenge environments (i.e., "targets"). In short, Docker allows you to package applications and their dependencies into **lightweight, portable containers**, while Kubernetes is a powerful platform for **managing and orchestrating containers**. CdsCTF is committed to using Kubernetes for managing its challenge environments. Therefore, regardless of deployment method, Kubernetes must be installed. The following tutorial will guide you through installing Kubernetes on a Linux server.

> This is just a guide — since many tutorials already exist online, this will simply offer some tips to help avoid unnecessary effort.

In CdsCTF-related practices, it's recommended to use K3s as the Kubernetes implementation. You can follow the [official documentation](https://docs.k3s.io/) for deployment.

If you want K3s to use Docker as the container runtime instead of containerd, run the following command in the terminal before running the K3s installation script. This is intended for **testing purposes only** and is not recommended for production:

```bash
INSTALL_K3S_EXEC="--docker"
```

Then proceed with the K3s installation command. From that point forward, your K3s container runtime will be Docker.

One more thing to note: K3s usually comes bundled with Traefik as the cluster's Ingress Controller. If you don't want this, or prefer to deploy your own, you can add the following flag to the installation command:

```bash
--disable-traefik
```

Once K3s is installed (without extra configuration), there will be a small but important change to your host system: whether you access `http://127.0.0.1` or `https://127.0.0.1`, you'll get a `404 page not found` response. This is because ports 80 and 443 are taken over by K3s's Traefik. If you later deploy using the Docker + K3s method or have other plans, you may need to adjust this behavior. Refer to the documentation for more details.
