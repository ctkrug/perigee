import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths so the build can be served from any subpath
  // (e.g. apps.charliekrug.com/perigee), not just the domain root.
  base: "./",
  build: {
    // The deployable bundle is committed at site/ and served as static
    // output; `npm run build` regenerates it in place.
    outDir: "site",
  },
});
