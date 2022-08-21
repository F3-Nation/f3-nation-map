import { serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";

export const orgTypes = pgSqlTable("org_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
