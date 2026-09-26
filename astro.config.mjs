import { defineConfig } from "astro/config";
// User site (bishesh.github.io) is served from the domain root, so no `base`.
export default defineConfig({
  site: "https://bishesh.github.io",
  trailingSlash: "always",
  server: { port: 8080 },
  devToolbar: { enabled: false },
});
