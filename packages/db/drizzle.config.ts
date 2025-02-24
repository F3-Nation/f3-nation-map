import type { Config } from "drizzle-kit";

import { env } from "@f3/env";

const url = env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not defined");

export default {
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  out: "../db/drizzle",
  // out: "../db/src/schema", // - needed for introspection
} satisfies Config;
