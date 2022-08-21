import { integer, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { eventTags } from "./eventTags";
import { orgs } from "./orgs";

export const eventTagsXOrg = pgSqlTable("event_tags_x_org", {
  id: serial("id").primaryKey(),
  eventTagId: integer("event_tag_id")
    .notNull()
    .references(() => eventTags.id),
  orgId: integer("org_id")
    .notNull()
    .references(() => orgs.id),
  colorOverride: varchar("color_override", { length: 30 }),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
