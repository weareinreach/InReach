import { env } from "./src/env/server.mjs";
import initTM from "next-transpile-modules";

const withTM = initTM(["@inreach/ui"]);

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return withTM(config);
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "https://inreach-catalog.herokuapp.com/:path*",
        },
      ],
    };
  },
});
