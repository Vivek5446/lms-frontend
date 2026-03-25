import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const backendAssetBaseUrl = backendUrl
  ? backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.facebook.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const rewrites = [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
    ];

    if (backendAssetBaseUrl) {
      rewrites.push({
        source: "/courses/:path*",
        destination: `${backendAssetBaseUrl}/courses/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
