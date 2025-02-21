import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "en-US",
	description:
		"The CdsCTF project is an open-source, high-performance, Jeopardy-style's CTF platform. ",
	themeConfig: {
		nav: [{ text: "Introduction", link: "/introduction/" }],

		sidebar: [
			{
				text: "Introduction",
				items: [{ text: "What is CdsCTF?", link: "/introduction/" }],
			},
		],
	},
});
