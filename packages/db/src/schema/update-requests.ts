import {
  boolean,
  date,
  integer,
  json,
  pgEnum,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { EventMeta, UpdateRequestMeta } from "@f3/shared/app/types";
import { UpdateRequestStatus } from "@f3/shared/app/enums";

import { customNumeric } from "../utils/custom-fields";
import { pgSqlTable } from "./_table";
import { events, locations, orgs } from "./schema";

export const UpdateRequestStatusEnum = pgEnum(
  "update_request_status",
  UpdateRequestStatus,
);

export const updateRequests = pgSqlTable("update_requests", {
  // Need uuid since we create these on the frontend sometimes
  id: uuid("id").primaryKey(),
  token: uuid("token").defaultRandom().notNull(),
  regionId: integer("region_id")
    .notNull()
    .references(() => orgs.id),

  eventId: integer("event_id").references(() => events.id),
  eventTypeIds: integer("event_type_ids").array(),
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
  eventMeta: json("event_meta").$type<EventMeta>(),
  eventContactEmail: text("event_contact_email"),

  locationName: text("location_name"),
  locationDescription: text("location_description"),
  locationAddress: text("location_address"),
  locationAddress2: text("location_address2"),
  locationCity: text("location_city"),
  locationState: varchar("location_state"),
  locationZip: varchar("location_zip"),
  locationCountry: varchar("location_country"),
  locationLat: customNumeric("location_lat", {
    precision: 8,
    scale: 5,
  }).$type<number>(),
  locationLng: customNumeric("location_lng", {
    precision: 8,
    scale: 5,
  }).$type<number>(),
  locationId: integer("location_id").references(() => locations.id),
  locationContactEmail: text("location_contact_email"),

  aoLogo: text("ao_logo"),

  submittedBy: text("submitted_by").notNull(),
  submitterValidated: boolean("submitter_validated").default(false),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  status: UpdateRequestStatusEnum("status").default("pending"),
  meta: json("meta").$type<UpdateRequestMeta>(),

  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
