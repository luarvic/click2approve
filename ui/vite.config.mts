import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    server: {
      port: 3333,
    },
    base: "/app",
    plugins: [react()],
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
