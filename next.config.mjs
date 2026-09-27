/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',
  images: { unoptimized: true },
  reactStrictMode: true,
  allowedDevOrigins: ['*.e2b.app', '*.app.github.dev', 'localhost'],
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
