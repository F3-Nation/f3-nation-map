import {
  boolean,
  integer,
  json,
  serial,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { attendanceTypes } from "./attendanceTypes";
import { events } from "./events";
import { users } from "./users";

export const attendance = pgSqlTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id").references(() => users.id),
    attendanceTypeId: integer("attendance_type_id")
      .notNull()
      .references(() => attendanceTypes.id),
    isPlanned: boolean("is_planned").notNull(),
    meta: json("meta"),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      eventUser: uniqueIndex("event_user").on(
        table.eventId,
        table.userId,
        table.attendanceTypeId,
        table.isPlanned,
      ),
    };
  },
);
