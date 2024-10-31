import { boolean, serial, text, timestamp } from "drizzle-orm/pg-core";

import { customNumeric } from "../utils/custom-fields";
import { pgSqlTable } from "./_table";

export const expansionUsers = pgSqlTable("expansion_users", {
  id: serial("id").primaryKey(),
  area: text("area").notNull(),
  pinnedLat: customNumeric("lat", { precision: 8, scale: 5 }),
  pinnedLng: customNumeric("lng", { precision: 8, scale: 5 }),
  userLat: customNumeric("userLat", { precision: 8, scale: 5 }),
  userLng: customNumeric("userLng", { precision: 8, scale: 5 }),
  interestedInOrganizing: boolean("interestedInOrganizing"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
