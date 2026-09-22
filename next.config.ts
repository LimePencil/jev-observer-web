import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 90, 95] },
  devIndicators: false,
};
export default nextConfig;
