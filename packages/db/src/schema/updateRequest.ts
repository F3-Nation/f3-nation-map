import {
  boolean,
  date,
  integer,
  json,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { customNumeric } from "../utils/custom-fields";
import { pgSqlTable } from "./_table";
import { events } from "./events";
import { locations } from "./locations";
import { orgs } from "./orgs";

export const updateRequests = pgSqlTable("update_requests", {
  id: uuid("id").primaryKey(),
  token: uuid("token").defaultRandom().notNull(),
  orgId: integer("org_id").references(() => orgs.id),

  eventId: integer("event_id").references(() => events.id),
  eventType: varchar("event_type", { length: 30 }),
  eventTag: varchar("event_tag", { length: 30 }),
  eventSeriesId: integer("event_series_id"),
  eventIsSeries: boolean("event_is_series"),
  eventIsActive: boolean("event_is_active"),
  eventHighlight: boolean("event_highlight"),
  eventStartDate: date("event_start_date"),
  eventEndDate: date("event_end_date"),
  eventStartTime: time("event_start_time", { withTimezone: false }),
  eventEndTime: time("event_end_time", { withTimezone: false }),
  eventDayOfWeek: varchar("event_day_of_week", { length: 30 }),
  eventName: varchar("event_name", { length: 100 }).notNull(),
  eventDescription: text("event_description"),
  eventRecurrencePattern: varchar("event_recurrence_pattern", { length: 30 }),
  eventRecurrenceInterval: integer("event_recurrence_interval"),
  eventIndexWithinInterval: integer("event_index_within_interval"),
  eventMeta: json("event_meta"),

  locationName: text("location_name"),
  locationDescription: text("location_description"),
  locationLat: customNumeric("location_lat", { precision: 8, scale: 5 }),
  locationLon: customNumeric("location_lon", { precision: 8, scale: 5 }),
  locationId: integer("location_id").references(() => locations.id),

  submittedBy: text("submitted_by"),
  submitterValidated: boolean("submitter_validated").default(false),
  validatedBy: text("validated_by"),
  validatedAt: timestamp("validated_at"),
  meta: json("meta"),

  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
