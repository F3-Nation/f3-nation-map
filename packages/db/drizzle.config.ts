import type { Config } from "drizzle-kit";

import { env } from "@f3/env";

const url = env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not defined");

const getDatabaseNameFromUri = (uri: string) => {
  const databaseNameRegex = /\/([^/?]+)(\?|$)/;
  const databaseNameMatch = databaseNameRegex.exec(uri);
  return databaseNameMatch ? databaseNameMatch[1] : undefined;
};

const databaseName = getDatabaseNameFromUri(url);

export default {
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  migrations: {
    schema: "drizzle",
    table: `__drizzle_migrations_${databaseName}`,
  },
  out: "../db/drizzle",
  // out: "../db/src/schema", // - needed for introspection
} satisfies Config;
