import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
      },
      {
        protocol: "https",
        hostname: "mir-s3-cdn-cf.behance.net",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.vnpayment.vn https://pay.vnpay.vn", // Allow VNPay scripts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles and Google Fonts
              "font-src 'self' https://fonts.gstatic.com", // Allow font loading
              "img-src 'self' data: blob: https: http:", // Allow images from various sources
              "media-src 'self' blob: data:", // Allow media
              "object-src 'none'", // Block objects for security
              "base-uri 'self'", // Restrict base URI
              "form-action 'self' https://sandbox.vnpayment.vn https://pay.vnpay.vn", // Allow forms to VNPay
              "frame-ancestors 'none'", // Prevent framing
              "connect-src 'self' ws: wss: https: data: blob:", // Allow websockets and HTTPS connections
              "worker-src 'self' blob:", // Allow web workers
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
