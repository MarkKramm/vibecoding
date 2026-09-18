import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The site reads generated JSON, never the Markdown directly.
// See docs/CONTENT-SCHEMA.md for the contract.
//
// BASE PATH
// GitHub Pages serves a project from a subdirectory — the repository name — so
// the site would live at https://<user>.github.io/vibecoding/ rather than at a
// domain root. Vite emits absolute asset URLs (/assets/...), which 404 under a
// subdirectory, so the base has to match where the site is actually served.
//
// The Pages workflow sets VITE_BASE to /vibecoding/. Everywhere else the base
// falls back to "/", which is correct for local dev, `vite preview`, and any
// host serving from a domain root. Keeping this in one environment-driven value
// means the Pages build and a root-hosted build cannot drift apart.
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      // Editing tools on Windows write a file by creating a sibling temp
      // directory (".Name.jsx.<pid>.<uuid>.tmpdir/Name.jsx.tmp") and renaming it
      // into place. Vite's watcher follows the directory while it exists, and if
      // the rename lands first the watcher hits a LOCKED handle and takes the
      // whole dev server down with EBUSY. That is not a code fault and it is not
      // reproducible on every platform, but it kills the server mid-session.
      //
      // Ignoring these transient directories is safe: they never contain
      // anything Vite should serve, only the half-written copy of a file that is
      // about to appear under its real name and trigger a normal rebuild.
      ignored: ["**/.*.tmpdir/**", "**/*.tmp"],
    },
  },
});
