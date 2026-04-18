/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["pdfkit", "exceljs"],
    optimizePackageImports: ["lucide-react", "@radix-ui/react-*"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
};

module.exports = nextConfig;
