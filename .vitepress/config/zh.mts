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
							text: "Docker + K8s",
							link: "/zh/guide/deployment/docker-k8s",
						},
						{
							text: "仅 K8s",
							link: "/zh/guide/deployment/k8s-only",
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
					text: "Q&A",
					items: [
						{
							text: "K3s 证书",
							link: "/zh/guide/qa/k3s-certs",
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
