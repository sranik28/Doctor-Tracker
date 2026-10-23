import path from 'node:path';

import type { NextConfig } from 'next';

const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Dashboard pages render only after a client-side session check, so their segments are never
    // in the prerender. Validate instant navigation only where a segment opts in with `instant`.
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },
  turbopack: {
    // Client is a standalone app; pin the root so the repo-level lockfile is not picked up.
    root: path.join(__dirname),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
