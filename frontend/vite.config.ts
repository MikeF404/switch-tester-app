import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_STRIPE_PUBLISHABLE_KEY
      ),
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: "http://10.0.0.216:5001",
          changeOrigin: true,
        },
      },
    },
  };
});
