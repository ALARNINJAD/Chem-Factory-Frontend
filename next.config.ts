import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks cross-origin dev requests by default; localhost is always
  // allowed, so only add entries here for devices on other hosts (e.g. a
  // phone test on the LAN) — and remove them once the test is over.
  allowedDevOrigins: [],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8090/api/:path*",
      },
    ];
  },
};

export default nextConfig;
