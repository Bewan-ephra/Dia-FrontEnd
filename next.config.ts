import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["semicalcined-nonprocessional-arlinda.ngrok-free.dev"],
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;