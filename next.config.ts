import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep only sequelize-cli external, bundle everything else including pg
  // This ensures pg and pg-hstore are properly bundled for Vercel serverless functions
  serverExternalPackages: ['sequelize-cli'],
 
};

export default nextConfig;
