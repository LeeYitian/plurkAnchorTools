import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: "安價小工具",
    name: "噗浪安價小工具",
    icons: [
      {
        src: "/icon_1024.png",
        type: "image/png",
        sizes: "1024x1024",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    start_url: "/",
    display: "standalone",
    description:
      "適用於噗浪（Plurk）的安價小工具，讓你輕鬆將長文斷成適合發文的長度，以及將噗文組合成長篇段落文字。",
  };
}
