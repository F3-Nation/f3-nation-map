import { boolean, integer, serial, timestamp } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { eventTypes } from "./eventTypes";
import { orgs } from "./orgs";

export const eventTypesXOrg = pgSqlTable("event_types_x_org", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("event_type_id")
    .notNull()
    .references(() => eventTypes.id),
  orgId: integer("org_id")
    .notNull()
    .references(() => orgs.id),
  isDefault: boolean("is_default").notNull(),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
