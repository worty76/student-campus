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
    const isDev = process.env.NODE_ENV === "development";

    // Development CSP (more permissive)
    const devCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.vnpayment.vn https://pay.vnpay.vn https://vercel.live https://student-campus.vercel.app https://*.vercel.com https://vercel.com localhost:* http://localhost:*",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://student-campus.vercel.app https://*.vercel.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com https://vercel.live https://student-campus.vercel.app https://*.vercel.com data:",
      "connect-src 'self' ws: wss: https: http: data: blob: https://vercel.live https://student-campus.vercel.app https://*.vercel.com wss://vercel.live wss://*.vercel.com ws://localhost:* http://localhost:*",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "frame-src https://vercel.live https://*.vercel.com https://vercel.com",
      "child-src https://vercel.live https://*.vercel.com https://vercel.com",
      "worker-src 'self' blob:",
      "form-action 'self' https://sandbox.vnpayment.vn https://pay.vnpay.vn",
    ];

    // Production CSP (more restrictive)
    const prodCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.vnpayment.vn https://pay.vnpay.vn https://vercel.live https://student-campus.vercel.app https://*.vercel.com https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://student-campus.vercel.app https://*.vercel.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com https://vercel.live https://student-campus.vercel.app https://*.vercel.com",
      "connect-src 'self' wss: https: data: blob: https://vercel.live https://student-campus.vercel.app https://*.vercel.com wss://vercel.live wss://*.vercel.com",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "frame-src https://vercel.live https://*.vercel.com https://vercel.com",
      "child-src https://vercel.live https://*.vercel.com https://vercel.com",
      "worker-src 'self' blob:",
      "form-action 'self' https://sandbox.vnpayment.vn https://pay.vnpay.vn",
    ];

    return [
      {
        // Apply CSP to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: (isDev ? devCSP : prodCSP).join("; "),
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
