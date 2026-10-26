import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// El backend (Express) no habilita CORS, por eso en desarrollo y en "preview"
// las peticiones a /api se reenvían al servidor mediante el proxy de Vite.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxy = {
    "/api": {
      target: env.API_PROXY_TARGET || "http://localhost:3000",
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { port: 5173, proxy: apiProxy },
    preview: { port: 4173, proxy: apiProxy },
  };
});
