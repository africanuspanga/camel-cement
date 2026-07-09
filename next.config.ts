import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Gallery admin uploads: videos up to 50 MB go through a server action.
      bodySizeLimit: "60mb",
    },
  },
};

export default nextConfig;
