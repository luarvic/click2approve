import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  return {
    server: {
      port: 3333,
    },
    base: "/ui",
    plugins: [react()],
    test: {
      globals: true,
      environment: "happy-dom",
    },
  };
});
