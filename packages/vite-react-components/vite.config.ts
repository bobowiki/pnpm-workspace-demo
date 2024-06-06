import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { name as pkName } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: pkName,
      formats: ["es", "umd"],
      fileName: (format) => `${pkName}.${format}.js`,
    },
    outDir: "dist",
  },
  plugins: [react(), dts({ rollupTypes: true })],
});
