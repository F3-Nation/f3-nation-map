import { serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";

export const attendanceTypes = pgSqlTable("attendance_types", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
