import type { AdapterAccount } from "@auth/core/adapters";
import { integer, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { users } from "./schema";

export const nextAuthAccounts = pgSqlTable(
  "auth_accounts",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  (nextAuthAccounts) => [
    {
      compoundKey: primaryKey({
        columns: [
          nextAuthAccounts.provider,
          nextAuthAccounts.providerAccountId,
        ],
      }),
    },
  ],
);

export const nextAuthSessions = pgSqlTable("auth_sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  created: timestamp("created").defaultNow(),
  updated: timestamp("updated").$onUpdate(() => new Date()),
});

export const nextAuthVerificationTokens = pgSqlTable(
  "auth_verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").$onUpdate(() => new Date()),
  },
  (vt) => [
    {
      compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    },
  ],
);
