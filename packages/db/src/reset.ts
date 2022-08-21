import { sql } from "drizzle-orm/sql";

import { env } from "@f3/env";

import { db } from ".";

const databaseUrl = env.DATABASE_URL;

export const reset = async () => {
  if (!databaseUrl) return;
  if (process.env.CI) return;

  process.stdout.write(
    `Resetting database ${databaseUrl} ARE YOU SURE? (y/n): `,
  );
  // wait for confirmation from the command line
  const confirmation = await new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
  if (confirmation !== "y") {
    throw new Error("Reset cancelled");
  }

  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);

  return;
};

if (require.main === module) {
  void reset()
    .then(() => console.log("Reset done"))
    .catch((e) => {
      console.log("Reset failed", e);
    })
    .finally(() => {
      process.exit();
    });
}
