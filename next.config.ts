// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@google/generative-ai'], // your original line
};

export default nextConfig;
