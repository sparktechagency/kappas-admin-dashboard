import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http", // Add HTTP protocol
        hostname: "10.10.7.103",
        port: '7001', // Specify the port if needed
      },
      {
        protocol: "https",
        hostname: "asif7001.binarybards.online",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.thecanuckmall.ca",
        pathname: "/**",
      }
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
