import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  reactCompiler: true,
}

export default nextConfig
