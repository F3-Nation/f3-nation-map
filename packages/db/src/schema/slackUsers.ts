import {
  boolean,
  integer,
  json,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { users } from "./users";

export const slackUsers = pgSqlTable("slack_users", {
  id: serial("id").primaryKey(),
  slackId: varchar("slack_id", { length: 100 }).notNull(),
  userName: varchar("user_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  slackTeamId: varchar("slack_team_id", { length: 100 }).notNull(),
  stravaAccessToken: varchar("strava_access_token", { length: 100 }),
  stravaRefreshToken: varchar("strava_refresh_token", { length: 100 }),
  stravaExpiresAt: timestamp("strava_expires_at"),
  stravaAthleteId: integer("strava_athlete_id"),
  meta: json("meta"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});
