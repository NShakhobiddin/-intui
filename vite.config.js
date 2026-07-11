import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base "./" — ilova istalgan sub-yo'lda (masalan GitHub Pages) ishlaydi
export default defineConfig({
  plugins: [
    react(),
    // Service worker: barcha fayllar keshlanadi — ikkinchi ochilish oniy,
    // internet uzilib qolsa ham ilova ishlayveradi
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      workbox: {
        globPatterns: ["**/*.{js,css,html,webp,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-files", expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } },
          },
          {
            urlPattern: /^https:\/\/telegram\.org\/js\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "telegram-sdk" },
          },
        ],
      },
      manifest: {
        name: "Intui — Ichki sezgingizni uyg'oting",
        short_name: "Intui",
        description: "Kartalar orqali ichki sezgini mashq qilish o'yini",
        lang: "uz",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#06050e",
        theme_color: "#0c0a1c",
        icons: [
          { src: "assets/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "assets/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  base: "./",
});
