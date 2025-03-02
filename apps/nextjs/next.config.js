import { fileURLToPath } from "url";
import _jiti from "jiti";

const jiti = _jiti(fileURLToPath(import.meta.url));

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
jiti("./src/env");
jiti("@acme/env");

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  reactStrictMode: true,

  webpack: (config, { webpack }) => {
    // https://github.com/handlebars-lang/handlebars.js/issues/1174#issuecomment-229918935
    config.resolve.alias.handlebars = "handlebars/dist/handlebars.min.js";
    return config;
  },
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/db",
    "@acme/ui",
    "@acme/validators",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgur.com",
        pathname: "/*",
      },
    ],
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  redirects: async () => {
    return [
      {
        source: "/map",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default config;
