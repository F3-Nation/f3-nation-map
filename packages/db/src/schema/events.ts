import {
  boolean,
  date,
  foreignKey,
  integer,
  json,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { eventTags } from "./eventTags";
import { eventTypes } from "./eventTypes";
import { locations } from "./locations";
import { orgs } from "./orgs";

export const events = pgSqlTable(
  "events",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id").references(() => orgs.id),
    locationId: integer("location_id").references(() => locations.id),
    eventTypeId: integer("event_type_id").references(() => eventTypes.id),
    eventTagId: integer("event_tag_id").references(() => eventTags.id),
    seriesId: integer("series_id"),
    isSeries: boolean("is_series").notNull(),
    isActive: boolean("is_active").notNull(),
    highlight: boolean("highlight").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startTime: time("start_time", { withTimezone: false }),
    endTime: time("end_time", { withTimezone: false }),
    dayOfWeek: integer("day_of_week"),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    recurrencePattern: varchar("recurrence_pattern", { length: 30 }),
    recurrenceInterval: integer("recurrence_interval"),
    indexWithinInterval: integer("index_within_interval"),
    paxCount: integer("pax_count"),
    fngCount: integer("fng_count"),
    preblast: text("preblast"),
    backblast: text("backblast"),
    preblastRich: json("preblast_rich"),
    backblastRich: json("backblast_rich"),
    preblastTs: integer("preblast_ts"),
    backblastTs: integer("backblast_ts"),
    meta: json("meta"),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (events) => {
    return {
      parentReference: foreignKey({
        columns: [events.seriesId],
        foreignColumns: [events.id],
        name: "events_series_id_fkey",
      }),
    };
  },
);
