import { defineConfig } from "vitepress";

export default defineConfig({
    lang: "zh-Hans",
    description: "CdsCTF 是一个开源、高性能的解题模式 CTF 平台",
    themeConfig: {
        nav: [
            { text: "指南", link: "/zh/guide/start/introduction" },
            { text: "功能", link: "/zh/feature/concept" },
            { text: "贡献", link: "/zh/contribution/overview/quick-start" },
        ],

        sidebar: {
            "/zh/guide": [
                {
                    text: "开始",
                    items: [
                        {
                            text: "简介",
                            link: "/zh/guide/start/introduction",
                        },
                        {
                            text: "技术栈",
                            link: "/zh/guide/start/tech-stack",
                        },
                    ],
                },
                {
                    text: "部署",
                    items: [
                        {
                            text: "快速开始",
                            link: "/zh/guide/deployment/quick-start",
                        },
                        {
                            text: "配置文件",
                            link: "/zh/guide/deployment/config",
                        },
                        {
                            text: "Docker + K3s",
                            link: "/zh/guide/deployment/docker-k3s",
                        },
                        {
                            text: "仅 K3s",
                            link: "/zh/guide/deployment/k3s-only",
                        },
                    ],
                },
                {
                    text: "衍生",
                    items: [
                        {
                            text: "遥测",
                            link: "/zh/guide/derivative/telemetry",
                        },
                        {
                            text: "反向代理",
                            link: "/zh/guide/derivative/reverse-proxy",
                        },
                    ],
                },
                {
                    text: "Q&A",
                    items: [
                        {
                            text: "K3s",
                            items: [
                                {
                                    text: "证书重置",
                                    link: "/zh/guide/qa/k3s/cert-reset",
                                },
                                {
                                    text: "Traefik 调整",
                                    link: "/zh/guide/qa/k3s/traefik-adjust",
                                },
                            ],
                        },
                    ],
                },
            ],
            "/zh/feature": [
                {
                    text: "开始",
                    items: [
                        {
                            text: "设计理念",
                            link: "/zh/feature/concept",
                        },
                    ],
                },
            ],
            "/zh/contribution": [
                {
                    text: "概览",
                    items: [
                        {
                            text: "快速开始",
                            link: "/zh/contribution/overview/quick-start",
                        },
                        {
                            text: "提交",
                            link: "/zh/contribution/overview/commit",
                        },
                        {
                            text: "代码风格",
                            link: "/zh/contribution/overview/style",
                        },
                    ],
                },
                {
                    text: "致谢",
                    link: "/zh/contribution/thanks/",
                },
            ],
        },

        docFooter: {
            prev: "上一页",
            next: "下一页",
        },

        outline: {
            label: "页面导航",
        },

        lightModeSwitchTitle: "切换到浅色模式",
        darkModeSwitchTitle: "切换到深色模式",
    },
});
