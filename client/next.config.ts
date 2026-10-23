import path from 'node:path';

import type { NextConfig } from 'next';

const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:5000';

// The rewrite destination is read when `next build` runs and baked into the build, so a
// production build without API_INTERNAL_URL would silently proxy /api/* to localhost.
if (process.env.NODE_ENV === 'production' && !process.env.API_INTERNAL_URL) {
  console.warn(
    '[next.config] API_INTERNAL_URL is not set: /api/* will be proxied to http://localhost:5000. ' +
      'Set it (at build time) to your API base URL for any real deployment.',
  );
}

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
