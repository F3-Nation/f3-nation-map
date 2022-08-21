import { integer, json, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { orgs } from "./orgs";

export const users = pgSqlTable("users", {
  id: serial("id").primaryKey(),
  f3Name: varchar("f3_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  homeRegionId: integer("home_region_id").references(() => orgs.id),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  meta: json("meta"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
