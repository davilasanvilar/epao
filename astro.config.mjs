// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  fonts: [
    {
      name: "Manrope",
      provider: fontProviders.google(),
      cssVariable: "--font-manrope",
      weights: ["200", "300", "400", "500", "600", "700", "800", "900"],
    },
  ],
});
