import type { NextConfig } from "next";

const DEFAULT_IMAGE_HOSTS = ["image.thum.io", "pbs.twimg.com"];

function imageRemotePatterns() {
  const configured = process.env.IMAGE_REMOTE_HOSTS;
  const hosts = (configured ?? DEFAULT_IMAGE_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return hosts.map((hostname) => ({
    protocol: "https" as const,
    hostname,
  }));
}

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: imageRemotePatterns(),
  },
  async redirects() {
    return [
      {
        source: "/writing/:slug",
        destination: "/writings/:slug",
        permanent: true,
      },
      {
        source: "/work/:slug",
        destination: "/works/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
