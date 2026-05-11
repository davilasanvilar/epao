// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: cloudflare(),

  fonts: [
    {
      name: "Manrope",
      provider: fontProviders.google(),
      cssVariable: "--font-manrope",
      weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    },
  ],
  vite: {
    ssr: {
      external: ["@aws-sdk/client-s3"],
    },
  },
});
