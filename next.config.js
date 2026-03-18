/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'eltoro2026.vip'],
    unoptimized: true,
  },
  // Disable ISR/full-route cache to avoid serving stale responses
  experimental: {
    isrFlushToDisk: false,
  },
  generateEtags: false,
  // Necessary to allow socket.io custom server
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
