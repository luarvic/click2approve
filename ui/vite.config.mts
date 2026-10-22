import react from "@vitejs/plugin-react-swc";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const buildId = command === "build" ? randomUUID() : "development";
  const analyticsId = loadEnv(mode, import.meta.dirname, "GOOGLE_ANALYTICS_ID").GOOGLE_ANALYTICS_ID?.trim() || "";
  if (analyticsId && !/^G-[A-Z0-9]+$/.test(analyticsId)) {
    throw new Error("GOOGLE_ANALYTICS_ID must be a GA4 measurement ID (G-...) or empty.");
  }
  const injectAnalytics = (html: string) =>
    analyticsId
      ? html.replace(
          "</head>",
          `<script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", ${JSON.stringify(analyticsId)});
</script>
</head>`,
        )
      : html;
  return {
    define: {
      "import.meta.env.APP_BUILD_ID": JSON.stringify(buildId),
    },
    server: {
      port: 3333,
      proxy: {
        // MkDocs owns public pages and their 404s; Vite owns /app and its tooling.
        "^/(?!app(?:/|\\?|$)|@vite/|@id/|@fs/|__vite|__open-in-editor)": "http://127.0.0.1:8000",
      },
    },
    base: "/app",
    plugins: [
      react(),
      {
        name: "optional-google-analytics",
        transformIndexHtml: injectAnalytics,
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "help.html",
            source: injectAnalytics(readFileSync(new URL("./public/help.html", import.meta.url), "utf8")),
          });
        },
      },
      {
        name: "app-build-version",
        apply: "build",
        generateBundle() {
          this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ buildId }) });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
                priority: 30,
              },
              { name: "emotion", test: /node_modules\/@emotion\//, priority: 20 },
              { name: "muiIcons", test: /node_modules\/@mui\/icons-material\//, priority: 10 },
              { name: "muiX", test: /node_modules\/@mui\/x-/, priority: 10 },
              { name: "muiCore", test: /node_modules\/@mui\// },
              { name: "state", test: /node_modules\/(mobx|mobx-react-lite)\// },
              {
                name: "utilities",
                test: /node_modules\/(axios|dayjs|password-validator|pretty-bytes|s-ago|styled-components)\//,
              },
            ],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: "./src/setupTests.ts",
    },
  };
});
