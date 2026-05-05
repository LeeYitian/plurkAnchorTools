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
      {
        source: "/unit",
        destination: "/unit/fromscan",
        permanent: false,
        has: [
          {
            type: "query",
            key: "key",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
