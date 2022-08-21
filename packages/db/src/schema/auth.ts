import type { AdapterAccount } from "@auth/core/adapters";
import { integer, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";

export const nextAuthUsers = pgSqlTable("next_auth_users", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});

export const nextAuthAccounts = pgSqlTable(
  "next_auth_accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => nextAuthUsers.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (nextAuthAccounts) => ({
    compoundKey: primaryKey({
      columns: [nextAuthAccounts.provider, nextAuthAccounts.providerAccountId],
    }),
  }),
);

export const nextAuthSessions = pgSqlTable("next_auth_sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => nextAuthUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});

export const nextAuthVerificationTokens = pgSqlTable(
  "next_auth_verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
