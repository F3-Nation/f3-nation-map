import { sql } from "drizzle-orm/sql";

import { env } from "@f3/env";

import { db } from ".";
import { alembicVersion } from "./schema/schema";

const databaseUrl = env.DATABASE_URL;

interface DbUser extends Record<string, unknown> {
  rolname: string;
}

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

  // We need to manually handle the alembic version table for moneyball's work
  let version_num: string | undefined;
  try {
    const [result] = await db.select().from(alembicVersion);
    version_num = result?.versionNum;
    console.log("Alembic version", version_num);
  } catch (e) {
    console.log("Alembic version not found");
  }

  // Get all non-system users before dropping the schema
  const users = await db.execute<DbUser>(sql`
    SELECT rolname FROM pg_roles 
    WHERE rolname NOT IN ('postgres', 'azure_pg_admin', 'azure_superuser', 'cloudsqlsuperuser')
  `);

  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);

  for (const user of users) {
    const quotedRolname = `"${user.rolname}"`;
    await db.execute(sql`
      GRANT USAGE ON SCHEMA public TO ${sql.raw(quotedRolname)};
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${sql.raw(quotedRolname)};
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${sql.raw(quotedRolname)};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO ${sql.raw(quotedRolname)};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO ${sql.raw(quotedRolname)};
    `);
  }

  // We need to manually handle the alembic version table for moneyball's work
  if (version_num) {
    await db.execute(
      sql`CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) PRIMARY KEY NOT NULL)`,
    );
    await db.execute(sql`
      INSERT INTO alembic_version (version_num) VALUES (${version_num});
    `);
  }

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
