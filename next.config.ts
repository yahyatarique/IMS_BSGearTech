import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'sequelize-cli', 'bcryptjs', 'jsonwebtoken'],
 
};

export default nextConfig;
