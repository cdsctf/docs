import { defineConfig } from "vitepress";
import en from "./en.mts";
import zh from "./zh.mts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "CdsCTF",
	description:
		"The CdsCTF project is an open-source, high-performance, Jeopardy-style's CTF platform. ",
	head: [["link", { rel: "icon", href: "/logo.svg" }]],
	rewrites: {
		"en/:rest*": ":rest*",
	},
	themeConfig: {
		logo: {
			light: "/logo.svg",
			dark: "/logo.svg",
		},
		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/elabosak233/cdsctf",
			},
		],
	},
	locales: {
		root: { label: "English", ...en },
		zh: { label: "简体中文", ...zh },
	},
});
