import { drizzle } from "drizzle-orm/postgres-js";
import pgConnectionString from "pg-connection-string";
import postgres from "postgres";

import { env } from "@acme/env";
import { isProduction, isTest } from "@acme/shared/common/constants";

import { schema } from "..";

export const getDatabaseNameFromUri = (uri: string) => {
  const databaseNameRegex = /\/([^/?]+)(\?|$)/;
  const databaseNameMatch = databaseNameRegex.exec(uri);
  return databaseNameMatch ? databaseNameMatch[1] : undefined;
};

export const getDbUrl = () => {
  const databaseUrl = isTest ? env.TEST_DATABASE_URL : env.DATABASE_URL;
  const databaseName = getDatabaseNameFromUri(databaseUrl);
  const useSsl = isProduction || (databaseName?.includes("_prod") ?? false);
  if (!databaseUrl) throw new Error("DATABASE_URL is not defined");
  return { databaseUrl, useSsl, databaseName };
};

export const getDb = () => {
  const { databaseUrl, useSsl } = getDbUrl();
  const sslOptions = useSsl ? { ssl: "require" as const } : undefined;
  return drizzle(postgres(databaseUrl, sslOptions), { schema });
};

export async function createDatabaseIfNotExists(
  connectionString: string,
): Promise<void> {
  const config = pgConnectionString.parse(connectionString);
  const dbName = config.database;
  if (!dbName) {
    throw new Error("Database name not found in connection string");
  }

  // Remove the database name from the connection string
  const newConnectionString = connectionString.replace(
    `/${dbName}`,
    "/postgres",
  );
  const useSsl = false; // dbName?.includes("_prod") ?? false;

  // Connect to the default 'postgres' database
  const sql = postgres(newConnectionString, {
    ssl: useSsl,
  });

  try {
    // Check if the database exists
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (result.length === 0) {
      console.log(`Database ${dbName} does not exist. Creating it now...`);
      // Create the database
      await sql`CREATE DATABASE ${sql(dbName)}`;
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}
