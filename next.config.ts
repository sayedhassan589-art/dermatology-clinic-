import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview
  allowedDevOrigins: [
    'https://preview-*.space.chatglm.site',
    'https://*.space.z.ai',
  ],
  // Empty turbopack config (Turbopack is default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
