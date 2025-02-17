import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  foreignKey,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  AttendanceMeta,
  EventMeta,
  LocationMeta,
  OrgMeta,
  UpdateRequestMeta,
  UserMeta,
} from "@f3/shared/app/types";

export const regionRole = pgEnum("region_role", ["user", "editor", "admin"]);
export const updateRequestStatus = pgEnum("update_request_status", [
  "pending",
  "approved",
  "rejected",
]);
export const userRole = pgEnum("user_role", ["user", "editor", "admin"]);
export const userStatus = pgEnum("user_status", ["active", "inactive"]);

export const alembicVersion = pgTable("alembic_version", {
  versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  verb: varchar().notNull(),
  imageUrl: varchar("image_url"),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orgs = pgTable(
  "orgs",
  {
    id: serial().primaryKey().notNull(),
    parentId: integer("parent_id"),
    orgTypeId: integer("org_type_id").notNull(),
    defaultLocationId: integer("default_location_id"),
    name: varchar().notNull(),
    description: varchar(),
    isActive: boolean("is_active").notNull(),
    logoUrl: varchar("logo_url"),
    website: varchar(),
    email: varchar(),
    twitter: varchar(),
    facebook: varchar(),
    instagram: varchar(),
    lastAnnualReview: date("last_annual_review"),
    meta: json().$type<OrgMeta>(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgTypeId],
      foreignColumns: [orgTypes.id],
      name: "orgs_org_type_id_fkey",
    }),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "orgs_parent_id_fkey",
    }),
  ],
);

export const attendance = pgTable(
  "attendance",
  {
    id: serial().primaryKey().notNull(),
    eventId: integer("event_id").notNull(),
    userId: integer("user_id").notNull(),
    isPlanned: boolean("is_planned").notNull(),
    meta: json().$type<AttendanceMeta>(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "attendance_event_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "attendance_user_id_fkey",
    }),
    unique("attendance_event_id_user_id_is_planned_key").on(
      table.eventId,
      table.userId,
      table.isPlanned,
    ),
  ],
);

export const attendanceTypes = pgTable("attendance_types", {
  id: serial().primaryKey().notNull(),
  type: varchar().notNull(),
  description: varchar(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const eventCategories = pgTable("event_categories", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const expansions = pgTable("expansions", {
  id: serial().primaryKey().notNull(),
  area: varchar().notNull(),
  pinnedLat: doublePrecision("pinned_lat").notNull(),
  pinnedLon: doublePrecision("pinned_lon").notNull(),
  userLat: doublePrecision("user_lat").notNull(),
  userLon: doublePrecision("user_lon").notNull(),
  interestedInOrganizing: boolean("interested_in_organizing").notNull(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orgTypes = pgTable("org_types", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const slackSpaces = pgTable(
  "slack_spaces",
  {
    id: serial().primaryKey().notNull(),
    teamId: varchar("team_id").notNull(),
    workspaceName: varchar("workspace_name"),
    botToken: varchar("bot_token"),
    settings: json(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [unique("slack_spaces_team_id_key").on(table.teamId)],
);

export const positions = pgTable(
  "positions",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar(),
    orgTypeId: integer("org_type_id"),
    orgId: integer("org_id"),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "positions_org_id_fkey",
    }),
    foreignKey({
      columns: [table.orgTypeId],
      foreignColumns: [orgTypes.id],
      name: "positions_org_type_id_fkey",
    }),
  ],
);

export const permissions = pgTable("permissions", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const slackUsers = pgTable(
  "slack_users",
  {
    id: serial().primaryKey().notNull(),
    slackId: varchar("slack_id").notNull(),
    userName: varchar("user_name").notNull(),
    email: varchar().notNull(),
    isAdmin: boolean("is_admin").notNull(),
    isOwner: boolean("is_owner").notNull(),
    isBot: boolean("is_bot").notNull(),
    userId: integer("user_id"),
    avatarUrl: varchar("avatar_url"),
    slackTeamId: varchar("slack_team_id").notNull(),
    stravaAccessToken: varchar("strava_access_token"),
    stravaRefreshToken: varchar("strava_refresh_token"),
    stravaExpiresAt: timestamp("strava_expires_at", { mode: "string" }),
    stravaAthleteId: integer("strava_athlete_id"),
    meta: json(),
    slackUpdated: timestamp("slack_updated", { mode: "string" }),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "slack_users_user_id_fkey",
    }),
    foreignKey({
      columns: [table.slackTeamId],
      foreignColumns: [slackSpaces.teamId],
      name: "slack_users_slack_team_id_fkey",
    }),
  ],
);

export const events = pgTable(
  "events",
  {
    id: serial().primaryKey().notNull(),
    orgId: integer("org_id").notNull(),
    locationId: integer("location_id"),
    seriesId: integer("series_id"),
    isSeries: boolean("is_series").notNull(),
    isActive: boolean("is_active").notNull(),
    highlight: boolean().notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    dayOfWeek: integer("day_of_week"),
    name: varchar().notNull(),
    description: varchar(),
    recurrencePattern: varchar("recurrence_pattern"),
    recurrenceInterval: integer("recurrence_interval"),
    indexWithinInterval: integer("index_within_interval"),
    paxCount: integer("pax_count"),
    fngCount: integer("fng_count"),
    preblast: varchar(),
    backblast: varchar(),
    preblastRich: json("preblast_rich"),
    backblastRich: json("backblast_rich"),
    preblastTs: doublePrecision("preblast_ts"),
    backblastTs: doublePrecision("backblast_ts"),
    meta: json().$type<EventMeta>(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    email: varchar(),
  },
  (table) => [
    foreignKey({
      columns: [table.locationId],
      foreignColumns: [locations.id],
      name: "events_location_id_fkey",
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "events_org_id_fkey",
    }),
    foreignKey({
      columns: [table.seriesId],
      foreignColumns: [table.id],
      name: "events_series_id_fkey",
    }),
  ],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: integer().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text(),
    idToken: text("id_token"),
    sessionState: text("session_state"),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "auth_accounts_userId_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    sessionToken: text("session_token").primaryKey().notNull(),
    userId: integer().notNull(),
    expires: timestamp().notNull(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "auth_sessions_userId_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const authVerificationToken = pgTable("auth_verification_token", {
  identifier: text().notNull(),
  token: text().notNull(),
  expires: timestamp().notNull(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const eventTags = pgTable(
  "event_tags",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar(),
    color: varchar(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    specificOrgId: integer("specific_org_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.specificOrgId],
      foreignColumns: [orgs.id],
      name: "event_tags_specific_org_id_fkey",
    }),
  ],
);

export const eventTypes = pgTable(
  "event_types",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar(),
    acronym: varchar(),
    categoryId: integer("category_id").notNull(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    specificOrgId: integer("specific_org_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [eventCategories.id],
      name: "event_types_category_id_fkey",
    }),
    foreignKey({
      columns: [table.specificOrgId],
      foreignColumns: [orgs.id],
      name: "event_types_specific_org_id_fkey",
    }),
  ],
);

export const locations = pgTable(
  "locations",
  {
    id: serial().primaryKey().notNull(),
    orgId: integer("org_id").notNull(),
    name: varchar().notNull(),
    description: varchar(),
    isActive: boolean("is_active").notNull(),
    latitude: doublePrecision(),
    longitude: doublePrecision(),
    addressStreet: varchar("address_street"),
    addressCity: varchar("address_city"),
    addressState: varchar("address_state"),
    addressZip: varchar("address_zip"),
    addressCountry: varchar("address_country"),
    meta: json().$type<LocationMeta>(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    email: varchar(),
    addressStreet2: varchar("address_street2"),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "locations_org_id_fkey",
    }),
  ],
);

export const roles = pgTable("roles", {
  id: serial().primaryKey().notNull(),
  description: varchar(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp({ mode: "date" })
    .$onUpdate(() => new Date())
    .notNull(),
  name: regionRole(),
});

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    f3Name: varchar("f3_name"),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    email: varchar().notNull(),
    emailVerified: timestamp("email_verified"),
    phone: varchar(),
    homeRegionId: integer("home_region_id"),
    avatarUrl: varchar("avatar_url"),
    meta: json().$type<UserMeta>(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    emergencyContact: varchar("emergency_contact"),
    emergencyPhone: varchar("emergency_phone"),
    emergencyNotes: varchar("emergency_notes"),
    role: userRole().default("user").notNull(),
    status: userStatus().default("active").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.homeRegionId],
      foreignColumns: [orgs.id],
      name: "users_home_region_id_fkey",
    }),
    unique("users_email_key").on(table.email),
  ],
);

export const updateRequests = pgTable(
  "update_requests",
  {
    id: uuid().primaryKey().notNull(),
    token: uuid().defaultRandom().notNull(),
    regionId: integer("region_id").notNull(),
    eventId: integer("event_id"),
    eventTag: varchar("event_tag", { length: 30 }),
    eventSeriesId: integer("event_series_id"),
    eventIsSeries: boolean("event_is_series"),
    eventIsActive: boolean("event_is_active"),
    eventHighlight: boolean("event_highlight"),
    eventStartDate: date("event_start_date"),
    eventEndDate: date("event_end_date"),
    eventStartTime: time("event_start_time"),
    eventEndTime: time("event_end_time"),
    eventDayOfWeek: varchar("event_day_of_week", { length: 30 }),
    eventName: varchar("event_name", { length: 100 }).notNull(),
    eventDescription: text("event_description"),
    eventRecurrencePattern: varchar("event_recurrence_pattern", { length: 30 }),
    eventRecurrenceInterval: integer("event_recurrence_interval"),
    eventIndexWithinInterval: integer("event_index_within_interval"),
    eventMeta: json("event_meta").$type<EventMeta>(),
    locationName: text("location_name"),
    locationDescription: text("location_description"),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    locationId: integer("location_id"),
    submittedBy: text("submitted_by").notNull(),
    submitterValidated: boolean("submitter_validated").default(false),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    meta: json().$type<UpdateRequestMeta>(),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp({ mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    eventTypeIds: integer("event_type_ids").array(),
    eventContactEmail: text("event_contact_email"),
    locationAddress: text("location_address"),
    locationAddress2: text("location_address2"),
    locationCity: text("location_city"),
    locationState: varchar("location_state"),
    locationZip: varchar("location_zip"),
    locationCountry: varchar("location_country"),
    locationContactEmail: text("location_contact_email"),
    aoLogo: text("ao_logo"),
    status: updateRequestStatus().default("pending"),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "update_requests_event_id_events_id_fk",
    }),
    foreignKey({
      columns: [table.locationId],
      foreignColumns: [locations.id],
      name: "update_requests_location_id_locations_id_fk",
    }),
    foreignKey({
      columns: [table.regionId],
      foreignColumns: [orgs.id],
      name: "update_requests_region_id_orgs_id_fk",
    }),
  ],
);

export const achievementsXOrg = pgTable(
  "achievements_x_org",
  {
    achievementId: integer("achievement_id").notNull(),
    orgId: integer("org_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.achievementId],
      foreignColumns: [achievements.id],
      name: "achievements_x_org_achievement_id_fkey",
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "achievements_x_org_org_id_fkey",
    }),
    primaryKey({
      columns: [table.achievementId, table.orgId],
      name: "achievements_x_org_pkey",
    }),
  ],
);

export const attendanceXAttendanceTypes = pgTable(
  "attendance_x_attendance_types",
  {
    attendanceId: integer("attendance_id").notNull(),
    attendanceTypeId: integer("attendance_type_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.attendanceId],
      foreignColumns: [attendance.id],
      name: "attendance_x_attendance_types_attendance_id_fkey",
    }),
    foreignKey({
      columns: [table.attendanceTypeId],
      foreignColumns: [attendanceTypes.id],
      name: "attendance_x_attendance_types_attendance_type_id_fkey",
    }),
    primaryKey({
      columns: [table.attendanceId, table.attendanceTypeId],
      name: "attendance_x_attendance_types_pkey",
    }),
  ],
);

export const eventTagsXEvents = pgTable(
  "event_tags_x_events",
  {
    eventId: integer("event_id").notNull(),
    eventTagId: integer("event_tag_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "event_tags_x_events_event_id_fkey",
    }),
    foreignKey({
      columns: [table.eventTagId],
      foreignColumns: [eventTags.id],
      name: "event_tags_x_events_event_tag_id_fkey",
    }),
    primaryKey({
      columns: [table.eventId, table.eventTagId],
      name: "event_tags_x_events_pkey",
    }),
  ],
);

export const eventsXEventTypes = pgTable(
  "events_x_event_types",
  {
    eventId: integer("event_id").notNull(),
    eventTypeId: integer("event_type_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "events_x_event_types_event_id_fkey",
    }),
    foreignKey({
      columns: [table.eventTypeId],
      foreignColumns: [eventTypes.id],
      name: "events_x_event_types_event_type_id_fkey",
    }),
    primaryKey({
      columns: [table.eventId, table.eventTypeId],
      name: "events_x_event_types_pkey",
    }),
  ],
);

export const orgsXSlackSpaces = pgTable(
  "orgs_x_slack_spaces",
  {
    orgId: integer("org_id").notNull(),
    slackSpaceId: integer("slack_space_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "orgs_x_slack_spaces_org_id_fkey",
    }),
    foreignKey({
      columns: [table.slackSpaceId],
      foreignColumns: [slackSpaces.id],
      name: "orgs_x_slack_spaces_slack_space_id_fkey",
    }),
    primaryKey({
      columns: [table.orgId, table.slackSpaceId],
      name: "orgs_x_slack_spaces_pkey",
    }),
  ],
);

export const rolesXPermissions = pgTable(
  "roles_x_permissions",
  {
    roleId: integer("role_id").notNull(),
    permissionId: integer("permission_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissions.id],
      name: "roles_x_permissions_permission_id_fkey",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: "roles_x_permissions_role_id_fkey",
    }),
    primaryKey({
      columns: [table.roleId, table.permissionId],
      name: "roles_x_permissions_pkey",
    }),
  ],
);

export const achievementsXUsers = pgTable(
  "achievements_x_users",
  {
    achievementId: integer("achievement_id").notNull(),
    userId: integer("user_id").notNull(),
    dateAwarded: timestamp("date_awarded", { mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.achievementId],
      foreignColumns: [achievements.id],
      name: "achievements_x_users_achievement_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "achievements_x_users_user_id_fkey",
    }),
    primaryKey({
      columns: [table.achievementId, table.userId],
      name: "achievements_x_users_pkey",
    }),
  ],
);

export const positionsXOrgsXUsers = pgTable(
  "positions_x_orgs_x_users",
  {
    positionId: integer("position_id").notNull(),
    orgId: integer("org_id").notNull(),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "positions_x_orgs_x_users_org_id_fkey",
    }),
    foreignKey({
      columns: [table.positionId],
      foreignColumns: [positions.id],
      name: "positions_x_orgs_x_users_position_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "positions_x_orgs_x_users_user_id_fkey",
    }),
    primaryKey({
      columns: [table.positionId, table.orgId, table.userId],
      name: "positions_x_orgs_x_users_pkey",
    }),
  ],
);

export const rolesXUsersXOrg = pgTable(
  "roles_x_users_x_org",
  {
    roleId: integer("role_id").notNull(),
    userId: integer("user_id").notNull(),
    orgId: integer("org_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "roles_x_users_x_org_org_id_fkey",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: "roles_x_users_x_org_role_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "roles_x_users_x_org_user_id_fkey",
    }),
    primaryKey({
      columns: [table.roleId, table.userId, table.orgId],
      name: "roles_x_users_x_org_pkey",
    }),
  ],
);

export const expansionsXUsers = pgTable(
  "expansions_x_users",
  {
    expansionId: integer("expansion_id").notNull(),
    userId: integer("user_id").notNull(),
    requestDate: timestamp("request_date", { mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    notes: varchar(),
  },
  (table) => [
    foreignKey({
      columns: [table.expansionId],
      foreignColumns: [expansions.id],
      name: "expansions_x_users_expansion_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "expansions_x_users_user_id_fkey",
    }),
    primaryKey({
      columns: [table.expansionId, table.userId],
      name: "expansions_x_users_pkey",
    }),
  ],
);
