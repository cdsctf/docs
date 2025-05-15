# 快速开始

如果你看到这里，说明你有贡献代码的想法，对嘛？那么我们就按照规则来。

希望你采取 Fork + Pull Request 的方式给 CdsCTF 添砖加瓦。

## Pull Request 之前

请先保证你的修改与主仓库没有产生冲突，若有，则通过 Sync Fork 的方式自行处理冲突。

## Merge 之后

如果你还有意愿给 CdsCTF 继续贡献代码，可以保留个人名下的 CdsCTF 仓库，在暂存区无内容时通过以下两条命令同步主仓库内容。

```bash
git fetch upstream
```

```bash
git reset --hard upstream/main
```

随后可以使用 Force Push 强制使得远程的个人 CdsCTF 仓库与主仓库同步。

当然，也可以再轻松点，先删掉个人名下的 CdsCTF，有意愿时再 Fork 即可。