import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    build: {
      rollupOptions: {
        input: {
          popup: "popup.html",
          background: "src/background.ts",
          content: "src/content.ts",
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      copyPublicDir: true,
      manifest: true,
    },
  };
});
console.log(JSON.stringify(config, null, 2));
export default config;
