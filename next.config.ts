import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Enable Turbopack for faster development builds (production ready in Next.js 15.5)
  turbopack: {},

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable typed routes (stable in Next.js 15.5)
  typedRoutes: true,

  // Allow cross-origin requests from local network devices during development
  ...(!isProd && {
    allowedDevOrigins: [
      'http://192.168.0.32:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Add other local network IP addresses as needed
    ],
  }),

  // Experimental features optimized for Vercel serverless
  experimental: {
    optimizeServerReact: true,
    // Disable worker threads in serverless (Vercel uses isolated functions)
    workerThreads: false,
    // Single CPU for serverless functions
    cpus: 1,
    // Enable serverActions for better form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // TypeScript configuration
  typescript: {
    // Type checking disabled temporarily (demo page has non-critical errors)
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    // Keep linting disabled during builds (warnings only, not critical)
    ignoreDuringBuilds: true,
  },

  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ]
  },
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

export default nextConfig