import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages should NOT be externalized - they need to be bundled
  // Remove 'pg' and 'pg-hstore' from serverExternalPackages
  serverExternalPackages: ['sequelize', 'sequelize-cli', 'bcryptjs', 'jsonwebtoken'],
 
};

export default nextConfig;
