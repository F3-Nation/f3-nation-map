import {
  boolean,
  integer,
  json,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { customNumeric } from "../utils/custom-fields";
import { pgSqlTable } from "./_table";
import { orgs } from "./orgs";

export const locations = pgSqlTable("locations", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => orgs.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull(),
  lat: customNumeric("lat", { precision: 8, scale: 5 }),
  lon: customNumeric("lon", { precision: 8, scale: 5 }),
  meta: json("meta"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
