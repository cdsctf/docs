import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-Hans",
	description: "CdsCTF 是一个开源、高性能的解题模式 CTF 平台",
	themeConfig: {
		nav: [
			{ text: "开始", link: "/zh/start/introduction" },
			{ text: "功能", link: "/zh/feature/concept" },
			{ text: "贡献", link: "/zh/contribution" },
		],

		sidebar: {
			"/zh/start": [
				{
					text: "开始",
					items: [
						{
							text: "简介",
							link: "/zh/start/introduction",
						},
						{
							text: "快速开始",
							link: "/zh/start/quick-start",
						},
					],
				},
				{
					text: "部署",
					items: [
						{
							text: "Docker + K3s",
							link: "/zh/start/deployment/docker-k3s",
						},
						{
							text: "仅 K3s",
							link: "/zh/start/deployment/k3s-only",
						},
					],
				},
				{
					text: "配置",
					items: [
						{
							text: "application.toml",
							link: "/zh/start/config/application.toml",
						},
					],
				},
				{
					text: "衍生",
					items: [
						{
							text: "遥测",
							link: "/zh/start/derivative/telemetry",
						},
						{
							text: "反向代理",
							link: "/zh/start/derivative/reverse-proxy",
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
									link: "/zh/start/qa/k3s/cert-reset",
								},
								{
									text: "Traefik 调整",
									link: "/zh/start/qa/k3s/traefik-adjust",
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
					text: "贡献",
					items: [
						{
							text: "快速上手",
							link: "/zh/contribution/",
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
