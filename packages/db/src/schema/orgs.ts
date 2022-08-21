import {
  boolean,
  date,
  foreignKey,
  integer,
  json,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { orgTypes } from "./orgTypes";

export const orgs = pgSqlTable(
  "orgs",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    orgTypeId: integer("org_type_id")
      .notNull()
      .references(() => orgTypes.id),
    defaultLocationId: integer("default_location_id"),
    // This causes a circular dependency so we have to remove it
    // .references(
    //   () => locations.id,
    // ),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull(),
    logo: text("logo"),
    website: varchar("website", { length: 255 }),
    email: varchar("email", { length: 255 }),
    twitter: varchar("twitter", { length: 100 }),
    facebook: varchar("facebook", { length: 100 }),
    instagram: varchar("instagram", { length: 100 }),
    slackId: varchar("slack_id", { length: 30 }),
    slackAppSettings: json("slack_app_settings"),
    lastAnnualReview: date("last_annual_review"),
    meta: json("meta"),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (orgs) => {
    return {
      parentReference: foreignKey({
        columns: [orgs.parentId],
        foreignColumns: [orgs.id],
        name: "orgs_parent_id_fkey",
      }),
    };
  },
);
