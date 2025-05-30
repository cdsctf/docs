import { defineConfig } from "vitepress";
import { MermaidMarkdown, MermaidPlugin } from "vitepress-plugin-mermaid";
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
        link: "https://github.com/cdsctf/cdsctf",
      },
    ],
    search: {
      provider: "local",
    },
    editLink: {
      pattern: "https://github.com/cdsctf/docs/edit/main/:path",
    },
  },
  locales: {
    root: { label: "English", ...en },
    zh: { label: "简体中文", ...zh },
  },
  markdown: {
    config: (md) => {
      md.use(MermaidMarkdown);
    },
  },
  vite: {
    plugins: [MermaidPlugin()],
    optimizeDeps: {
      include: ["mermaid"],
    },
    ssr: {
      noExternal: ["mermaid"],
    },
  },
});
