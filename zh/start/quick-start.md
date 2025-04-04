# 快速开始

如果你想要部署一个 CdsCTF 实例，这其实不是一件很容易的事情，但是，我保证后面会让事情变得简单一点。

这篇 *快速开始* 并不会直接教你详细的部署方法，而是教你选择符合自己需求的方式并且给予一些必需的前置帮助。

## 虚拟化

在 CTF 中，我们通常使用 Docker 或者 Kubernetes 来实现题目动态环境（或者说靶机）的控制。简单来说，Docker 是一个能将应用及其依赖 **打包成轻量级、可移植容器** 的工具，而 Kubernetes 又是一个 **用于管理和编排容器** 的强大平台。但是 Docker 和 Kubernetes 的能力不局限于支持 CTF 题目的动态环境，而广泛应用于微服务架构、自动化部署、可扩展应用管理等领域。

在 CdsCTF 推荐的两种部署方式中，都需要 Kubernetes，但是 Docker 可以在你并不清楚自己在做什么的时候，尽可能地降低难度。所以接下来的教程会引导你在一台 Linux 服务器上安装 Docker 和 Kubernetes。

> 仅仅是引导，因为互联网上有很多基础教程，这里仅仅是提供一些提示，以防付出不必要的努力。

### Docker

我们需要安装的是 DockerCE，这可不是 `apt-get install docker` 这么简单。

> [!TIP]
> 我发现我能够运行 `apt-get install docker.io` 安装 Docker，这样是合理的吗？
>
> 其实并不合理，软件包 `docker.io` 来自 Ubuntu 官方软件仓库，由 Ubuntu 维护，通常是一个较老的版本，不会及时更新到 Docker 的最新稳定版本（且缺失了一个对于 Docker 而言的重要小工具 Docker Compose）。言而总之，它不是 DockerCE，不完全符合我们的需求。

安装 DockerCE，你可以按照 [官方文档](https://docs.docker.com/engine/install/) 一步步做下去。

但如果你是国内用户，你可以在互联网上查找更多符合当前网络条件的教程。在此处推荐参考 [清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/) 中的 DockerCE 安装方法。

如果你能顺利安装完 DockerCE，且是国内用户，那么请你不要忘记配置镜像源。

通常，Docker 针对源的配置文件通常存放于 `/etc/docker/daemon.json`，如果没有，那就创建一个，然后写出类似于下面的配置：

```json
{
    "registry-mirrors": [
        "..."
    ]
}
```

至于具体的镜像源链接，请参考互联网上的更多资料。

至此，你的 Docker 安装完毕。

### Kubernetes

在与 CdsCTF 相关的实践中，推荐使用 K3s 作为 Kubernetes 的实现。可以参考 [官方文档](https://docs.k3s.io/) 进行部署。

针对国内用户，可以使用 K3s 的加速安装命令：

```bash
curl –sfL \
    https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
    INSTALL_K3S_MIRROR=cn sh -s - \
    --system-default-registry "registry.cn-hangzhou.aliyuncs.com"
```

接下来我们要区别一个误区，就是 Docker 和 Kubernetes 的关系。虽然 Docker 几乎可以是虚拟化容器的代名词，但并不意味着 Kubernetes 对 Docker 就是依赖关系。换句话说，虽然 Docker 确实可以通过镜像运行容器（即 Docker 是一个容器运行时），但是现在的 Kubernetes 的默认容器运行时却不是 Docker（而是 containerd）。

但是这并不意味着我们一定要将 K3s 的容器运行时从 containerd 改成 Docker，因为这其中有许多微妙的问题，可能会给你造成困扰。所以如果你是 **以测试为目的** 部署 CdsCTF，可以试试看更改容器运行时为 Docker。

你只需要在运行上面的安装命令之前，在终端使用命令：

```bash
INSTALL_K3S_EXEC="--docker"
```

随后再运行上文的安装命令，从现在开始，你的 K3s 的容器运行时就是 Docker 了。再次强调，这是 **以测试为目的**，否则不建议这么做。

安装完 K3s 后，你的宿主机会有一个小变化。就是不论是访问 `http://127.0.0.1` 还是 `https://127.0.0.1`，返回都是 `404 page not found`，因为此时你宿主机的 80 和 443 端口，全都会被 K3s 的 Traefik 接管。如果你后续使用 Docker + K3s 的方式部署或者另有安排，那么我们可能需要对此做出一点调整，可详见文档更多内容。

## 中间件

CdsCTF 需要依赖多个中间件，以提供稳定的服务。那这意味着需要为宿主机配置这些中间件吗？并非如此，我们可以使用 Docker Compose 或者 K3s 通过镜像创建这些中间件，并且妥当处理中间件与 CdsCTF 之间的关系。

中间件|功能
:--|:--
[PostgreSQL](https://www.postgresql.org/)|数据持久化
[NATS](https://nats.io/)|消息队列
[Valkey](https://valkey.io/)|缓存
[Kubernetes](https://kubernetes.io/)|虚拟化与容器编排
[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)|遥测

为什么这里又出现了一次 Kubernetes？因为 CdsCTF 不仅仅需要让 Docker 或 Kubernetes 运行 CdsCTF 本身，还需要调用到 Kubernetes 的控制平面，以实现对题目动态环境的控制。所以 Kubernetes 也是 CdsCTF 的中间件之一。

我们需要为 CdsCTF 配置数据库的连接凭据，也需要配置缓存的 URL（这些配置详见后续对 CdsCTF 后端配置文件 `constant.toml` 的描述），而像其他中间件一样，也需要提供连接到 Kubernetes 控制平面的配置。

这里先给出获得此配置文件的命令，后续两种部署方法都能用得上：

```bash
cat /etc/rancher/k3s/k3s.yaml
```

你可以将获得到的文本保存为 `k8s.yml`。