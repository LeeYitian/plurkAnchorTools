import type { NextConfig } from "next";
import Icons from "unplugin-icons/webpack";

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
  webpack(config) {
    config.plugins.push(
      Icons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    return config;
  },
};

export default nextConfig;
