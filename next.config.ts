import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained server build for the Docker/Oracle deploy — copies only the
  // traced runtime into .next/standalone so the image stays small.
  output: "standalone",
  // Pin the workspace root so a stray lockfile higher up the tree doesn't get
  // picked as the root.
  turbopack: {
    root: path.join(__dirname),
  },
  // sharp runs in the Node API routes; keep it external to the server bundle.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
