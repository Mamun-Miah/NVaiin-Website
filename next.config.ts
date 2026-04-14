import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["https://preview-chat-7edb64e0-3d95-4048-a15e-fbe90e4a36f4.space.z.ai"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.nvaiin.com",
      },
    ],
  },
};

export default nextConfig;
