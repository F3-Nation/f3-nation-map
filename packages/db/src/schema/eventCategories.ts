import { serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";

export const eventCategories = pgSqlTable("event_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
