import type { NextConfig } from "next";

const projetoRoot = __dirname;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: projetoRoot,
  async rewrites() {
    const api = process.env.API_URL ?? "http://localhost:8080";
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
  turbopack: {
    root: projetoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack: (config) => {
    // No HD externo, limita o watcher para evitar scan de H:\ e compile “infinito”.
    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 400,
      ignored: [
        "**/.git/**",
        "**/node_modules/**",
        "**/.next/**",
        "**/Config.Msi",
        "**/System Volume Information/**",
        "**/WindowsApps/**",
        "**/DumpStack.log.tmp",
        "**/pagefile.sys",
        "**/hiberfil.sys",
        "**/swapfile.sys",
      ],
    };
    return config;
  },
};

export default nextConfig;
