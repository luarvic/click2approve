import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  return {
    server: {
      port: 3333,
    },
    base: "/ui",
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            emotion: ["@emotion/react", "@emotion/styled"],
            muiCore: [
              "@mui/material",
              "@mui/styled-engine-sc",
            ],
            muiIcons: ["@mui/icons-material"],
            muiX: [
              "@mui/lab",
              "@mui/x-data-grid",
              "@mui/x-date-pickers",
            ],
            react: ["react", "react-dom", "react-router-dom"],
            state: ["mobx", "mobx-react-lite"],
            utilities: [
              "axios",
              "dayjs",
              "password-validator",
              "pretty-bytes",
              "react-toastify",
              "s-ago",
              "styled-components",
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
