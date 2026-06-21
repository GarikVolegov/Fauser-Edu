import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ command }) => {
  const isServe = command === "serve";

  // The build must never depend on runtime env (CI/deploy build with no PORT).
  // Only the dev/preview server needs a real PORT.
  const rawPort = process.env.PORT;
  if (isServe && !rawPort) {
    throw new Error(
      "PORT environment variable is required to run the dev/preview server.",
    );
  }
  const port = rawPort ? Number(rawPort) : 5173;
  if (isServe && (Number.isNaN(port) || port <= 0)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = process.env.BASE_PATH ?? "/";

  // Dev-only auth fallback: when serving with no Clerk publishable key, alias
  // `@clerk/react` to a local mock (src/dev/clerk-mock.tsx) so the SPA runs
  // locally with no secrets. The regex is anchored so `@clerk/react/internal`
  // and other subpaths still resolve to the real package.
  const devAuth = isServe && !process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const clerkMock = path.resolve(import.meta.dirname, "src/dev/clerk-mock.tsx");

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(isServe && process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: [
        ...(devAuth
          ? [{ find: /^@clerk\/react$/, replacement: clerkMock }]
          : []),
        {
          find: "@assets",
          replacement: path.resolve(
            import.meta.dirname,
            "..",
            "..",
            "attached_assets",
          ),
        },
        { find: "@", replacement: path.resolve(import.meta.dirname, "src") },
      ],
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Split heavy vendors into their own chunks so the initial bundle
          // stays small; charts (recharts/d3) load only with the Analytics page.
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (/\/react(-dom)?\//.test(id) || id.includes("scheduler"))
              return "react-vendor";
            if (id.includes("@clerk")) return "clerk-vendor";
            if (id.includes("framer-motion")) return "motion-vendor";
            if (id.includes("recharts") || id.includes("/d3-"))
              return "charts-vendor";
            if (id.includes("@radix-ui")) return "radix-vendor";
          },
        },
      },
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      // Dev-only: forward same-origin /api calls (incl. /api/__clerk) to the
      // backend API server. In production Replit's application router handles
      // this routing, so this proxy only affects local `vite dev`.
      proxy: {
        "/api": {
          target: process.env.API_PROXY_TARGET ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
