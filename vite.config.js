import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
  },
  build: {
    target: "es2020",
    outDir: path.resolve(__dirname, "public/react"),
    emptyOutDir: true,
    copyPublicDir: false,
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/cliente/configuracao/main.jsx"),
      formats: ["es"],
      fileName: () => "config-app.js",
      cssFileName: "config-app",
      name: "ConfigAppBundle",
    },
  },
});
