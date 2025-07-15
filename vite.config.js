import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        newtab: "src/newtab/index.html",
        popup: "src/popup/index.html",
        options: "src/options/index.html",
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
