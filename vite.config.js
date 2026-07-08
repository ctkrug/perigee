import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths so the build can be served from any subpath
  // (e.g. apps.charliekrug.com/perigee), not just the domain root.
  base: "./",
});
