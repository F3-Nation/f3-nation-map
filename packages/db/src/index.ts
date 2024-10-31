import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@f3/env";

import { attendance } from "./schema/attendance";
import { attendanceTypes } from "./schema/attendanceTypes";
import {
  nextAuthAccounts,
  nextAuthSessions,
  nextAuthUsers,
  nextAuthVerificationTokens,
} from "./schema/auth";
import { eventCategories } from "./schema/eventCategories";
import { events } from "./schema/events";
import { eventTags } from "./schema/eventTags";
import { eventTagsXOrg } from "./schema/eventTagsXOrg";
import { eventTypes } from "./schema/eventTypes";
import { eventTypesXOrg } from "./schema/eventTypesXOrg";
import { expansionUsers } from "./schema/expansionUsers";
import { locations } from "./schema/locations";
import { orgs } from "./schema/orgs";
import { orgTypes } from "./schema/orgTypes";
import { slackUsers } from "./schema/slackUsers";
import { users } from "./schema/users";

export const schema = {
  nextAuthAccounts,
  nextAuthSessions,
  nextAuthUsers,
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
  expansionUsers,
};

export { pgSqlTable as tableCreator } from "./schema/_table";

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
