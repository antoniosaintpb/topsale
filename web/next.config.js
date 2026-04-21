/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  async rewrites() {
    const apiUpstream = process.env.API_UPSTREAM_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUpstream}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
