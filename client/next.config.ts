import path from 'node:path';

import type { NextConfig } from 'next';

const apiProxyUrl = process.env.API_PROXY_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
        destination: `${apiProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
