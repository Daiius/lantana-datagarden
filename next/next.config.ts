import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/lantana-datagarden',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/*.sw[pon]', '**/.*.sw[pon]'],
      };
    }
    return config;
  },
};

export default nextConfig;

