import { defineConfig } from "astro/config";

// Page copy (src/data/*.yaml) is read with fs, which Vite doesn't track, so reload the browser when it changes.
// (Lists use file() loaders, which Astro already watches.)
const reloadOnData = {
  name: "reload-on-data",
  configureServer(server) {
    server.watcher.add("src/data");
    server.watcher.on("change", (f) => { if (/src\/data\/.*\.ya?ml$/.test(f)) server.ws.send({ type: "full-reload" }); });
  },
};
// User site (bishesh.github.io) is served from the domain root, so no `base`.
export default defineConfig({
  site: "https://bishesh.github.io",
  trailingSlash: "always",
  server: { port: 8080 },
  devToolbar: { enabled: false },
  vite: { plugins: [reloadOnData] },
});
