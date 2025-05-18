import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add the following line:
  allowedDevOrigins: ['6000-firebase-studio-1747495770862.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev', '9000-firebase-studio-1747495770862.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev'],
};

export default nextConfig;
