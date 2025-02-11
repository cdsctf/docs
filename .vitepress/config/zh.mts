import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-Hans",
	description: "CdsCTF 是一个开源、高性能的解题模式 CTF 平台",
	themeConfig: {
		nav: [
			{ text: "指南", link: "/zh/guide/start/introduction" },
			{ text: "贡献", link: "/zh/contribution" },
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
							text: "快速开始",
							link: "/zh/guide/start/quick-start",
						},
					],
				},
				{
					text: "部署",
					items: [
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
					text: "配置",
					items: [
						{
							text: "application.toml",
							link: "/zh/guide/config/application.toml",
						},
					],
				},
				{
					text: "功能",
					items: [
						{
							text: "基础",
							link: "/zh/guide/feature/basic",
						},
						{
							text: "遥测",
							link: "/zh/guide/feature/telemetry",
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
