import { serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";

export const eventTags = pgSqlTable("event_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 30 }),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
