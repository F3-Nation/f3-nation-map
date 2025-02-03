import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@f3/env";

import {
  nextAuthAccounts,
  nextAuthSessions,
  nextAuthVerificationTokens,
} from "./schema/auth";
import {
  attendance,
  attendanceTypes,
  eventCategories,
  events,
  eventTags,
  eventTagsXOrg,
  eventTypes,
  eventTypesXOrg,
  locations,
  orgs,
  orgTypes,
  slackUsers,
  users,
} from "./schema/schema";
import { updateRequests } from "./schema/updateRequest";

export const schema = {
  nextAuthAccounts,
  nextAuthSessions,
  nextAuthVerificationTokens,
  users,
  orgs,
  events,
  attendanceTypes,
  attendance,
  eventCategories,
  eventTags,
  eventTagsXOrg,
  eventTypes,
  eventTypesXOrg,
  locations,
  orgTypes,
  slackUsers,
  updateRequests,
};

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

const getDb = () => {
  return drizzle(postgres(databaseUrl), { schema });
};

export type AppDb = ReturnType<typeof getDb>;

declare global {
  // eslint-disable-next-line no-var
  var db: AppDb | null;
}

let db: AppDb;

export * from "drizzle-orm";

if (env.NODE_ENV === "production") {
  db = getDb();
} else {
  if (!global.db) global.db = getDb();
  db = global.db;
}

export { db };
