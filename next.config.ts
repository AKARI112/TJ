import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  experimental: { optimizePackageImports: ["lucide-react", "motion"] },
  images: { remotePatterns: [{ protocol: "https", hostname: "api.islamic.app", pathname: "/v1/mushaf/page/**" }] },
};

export default nextConfig;
