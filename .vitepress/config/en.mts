import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  description:
    "The CdsCTF project is an open-source, high-performance, Jeopardy-style's CTF platform. ",
  themeConfig: {
    nav: [{ text: "Guide", link: "/guide/start/introduction" }],

    sidebar: {
      "/guide": [
        {
          text: "Start",
          items: [
            {
              text: "Introduction",
              link: "/guide/start/introduction",
            },
            {
              text: "Tech Stack",
              link: "/guide/start/tech-stack",
            },
          ],
        },
        {
          text: "Deployment",
          items: [
            {
              text: "Quick Start",
              link: "/guide/deployment/quick-start",
            },
            {
              text: "Configuration",
              link: "/guide/deployment/config",
            },
            {
              text: "Docker + K3s",
              link: "/guide/deployment/docker-k3s",
            },
            {
              text: "K3s Only",
              link: "/guide/deployment/k3s-only",
            },
          ],
        },
        {
          text: "Derivative",
          items: [
            {
              text: "Telemetry",
              link: "/guide/derivative/telemetry",
            },
            {
              text: "Reverse Proxy",
              link: "/guide/derivative/reverse-proxy",
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
                  text: "Cert Reset",
                  link: "/guide/qa/k3s/cert-reset",
                },
                {
                  text: "Traefik Adjust",
                  link: "/guide/qa/k3s/traefik-adjust",
                },
              ],
            },
          ],
        },
      ],
      "/feature": [
        {
          text: "Start",
          items: [
            {
              text: "Concept",
              link: "/feature/concept",
            },
          ],
        },
      ],
    },
  },
});
