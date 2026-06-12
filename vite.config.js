import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" — ilova istalgan sub-yo'lda (masalan GitHub Pages) ishlaydi
export default defineConfig({
  plugins: [react()],
  base: "./",
});
