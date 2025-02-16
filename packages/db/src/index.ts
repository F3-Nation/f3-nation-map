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
  eventsXEventTypes,
  eventTags,
  eventTypes,
  locations,
  orgs,
  orgTypes,
  permissions,
  roles,
  rolesXPermissions,
  rolesXUsersXOrg,
  slackUsers,
  users,
} from "./schema/schema";
import { updateRequests } from "./schema/update-requests";

export const schema = {
  attendanceTypes,
  attendance,
  events,
  eventCategories,
  eventTags,
  eventTypes,
  eventsXEventTypes,
  locations,
  nextAuthAccounts,
  nextAuthSessions,
  nextAuthVerificationTokens,
  orgs,
  orgTypes,
  permissions,
  roles,
  rolesXPermissions,
  rolesXUsersXOrg,
  slackUsers,
  updateRequests,
  users,
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
