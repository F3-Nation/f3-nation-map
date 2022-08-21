import { integer, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { eventCategories } from "./eventCategories";

export const eventTypes = pgSqlTable("event_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => eventCategories.id),
  description: text("description"),
  acronym: varchar("acronym", { length: 30 }),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
