/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // The backend is reached via NEXT_PUBLIC_API_BASE_URL at build time
  // (because the bundle is served to the browser, not the server).
  // `transpilePackages` is empty here; we keep things simple.
  experimental: {},
};

export default nextConfig;
