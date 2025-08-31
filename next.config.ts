import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      // Basic redirect
      {
        source: "/",
        destination: "/chunk",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
