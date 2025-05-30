# 简介

CdsCTF 是一个基于 Rust 的现代化开源 Capture The Flag (CTF) 平台，提供了高度自定义的题库设计、比赛举办等功能。
最初由 [ElaBosak233 (Ela)](https://github.com/ElaBosak233) 开发，且持续维护。

本项目基于 GPL-3.0 协议开源，使用和修改均需遵守此开源协议。

![主页](/images/index.webp)

## 特性

### 题库

- 高度可自定义的题目：支持多种题目类型和配置选项
- 多样化的题目类型：
  - 附件：题目可携带固定的附件以供下载
  - 动态环境：自动生成并通过容器环境变量下发动态的 flag
- 更强大的提交检查策略：基于 Rune 脚本实现的更加灵活的 flag 检查机制

### 比赛

- 动态分值：基于难度系数、分数上下限和 AC 次数计算的动态分值
- 排名奖励：对排名前列的团队分别奖励额外比例的分值
- 灵活的赛题管理：比赛进行中可随时上下题，且可以设置冻结时间

### 虚拟化

- 基于 Kubernetes 的动态环境管理：自动创建、分发和管理容器
- 资源限制：可严格控制每个容器的 CPU、内存和存储资源
- 网络隔离控制：可选择性地允许或禁止容器访问互联网
- 生命周期：自动清理过期环境，且支持环境续期

## 致谢

### 贡献者

谢谢每一位给 CdsCTF 作出贡献的小伙伴！没有你的帮助，不会有今天的 CdsCTF。

![Contributors of CdsCTF](https://contrib.rocks/image?repo=cdsctf/cdsctf)

## Stars

![Stars of CdsCTF](https://starchart.cc/cdsctf/cdsctf.svg?variant=adaptive)
