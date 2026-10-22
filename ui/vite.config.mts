import react from "@vitejs/plugin-react-swc";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const buildId = command === "build" ? randomUUID() : "development";
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
