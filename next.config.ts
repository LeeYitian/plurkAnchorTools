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
  webpack(config, { dev }) {
    config.plugins.push(
      Icons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    // unplugin-icons virtual modules can't be serialized to the filesystem cache;
    // webpack tries to stat the virtual paths on restart and throws ENOENT.
    if (dev) {
      config.cache = { type: "memory" };
    }

    return config;
  },
};

export default nextConfig;
