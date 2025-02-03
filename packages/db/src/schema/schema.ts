import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  doublePrecision,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  serial,
  time,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const alembicVersion = pgTable("alembic_version", {
  versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
});

export const magiclinkauthrecord = pgTable("magiclinkauthrecord", {
  id: serial().primaryKey().notNull(),
  email: varchar().notNull(),
  // TODO: failed to parse database type 'bytea'
  otpHash: bytea("otp_hash").notNull(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  expiration: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  clientIp: varchar("client_ip").notNull(),
  recentAttempts: integer("recent_attempts").notNull(),
});

export const magiclinkauthsession = pgTable("magiclinkauthsession", {
  id: serial().primaryKey().notNull(),
  email: varchar().notNull(),
  persistentId: varchar("persistent_id").notNull(),
  sessionToken: varchar("session_token").notNull(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  expiration: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const roles = pgTable("roles", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  verb: varchar().notNull(),
  imageUrl: varchar("image_url"),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
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
    meta: json().$type<{
      latLonKey?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    }>(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
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

export const permissions = pgTable("permissions", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const locations = pgTable(
  "locations",
  {
    id: serial().primaryKey().notNull(),
    orgId: integer("org_id").notNull(),
    name: varchar().notNull(),
    email: varchar(),
    description: varchar(),
    isActive: boolean("is_active").notNull(),
    latitude: doublePrecision(),
    longitude: doublePrecision(),
    addressStreet: varchar("address_street"),
    addressCity: varchar("address_city"),
    addressState: varchar("address_state"),
    addressZip: varchar("address_zip"),
    addressCountry: varchar("address_country"),
    meta: json(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "locations_org_id_fkey",
    }),
  ],
);

export const positions = pgTable(
  "positions",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar(),
    orgTypeId: integer("org_type_id"),
    orgId: integer("org_id"),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
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

export const slackSpaces = pgTable(
  "slack_spaces",
  {
    id: serial().primaryKey().notNull(),
    teamId: varchar("team_id").notNull(),
    workspaceName: varchar("workspace_name"),
    botToken: varchar("bot_token"),
    settings: json(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [unique("slack_spaces_team_id_key").on(table.teamId)],
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
    startDate: date("start_date").notNull(),
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
    meta: json(),
    email: varchar(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
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

export const expansions = pgTable("expansions", {
  id: serial().primaryKey().notNull(),
  area: varchar().notNull(),
  pinnedLat: doublePrecision("pinned_lat").notNull(),
  pinnedLon: doublePrecision("pinned_lon").notNull(),
  userLat: doublePrecision("user_lat").notNull(),
  userLon: doublePrecision("user_lon").notNull(),
  interestedInOrganizing: boolean("interested_in_organizing").notNull(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const attendance = pgTable(
  "attendance",
  {
    id: serial().primaryKey().notNull(),
    eventId: integer("event_id").notNull(),
    userId: integer("user_id").notNull(),
    isPlanned: boolean("is_planned").notNull(),
    meta: json(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
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
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    f3Name: varchar("f3_name"),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    email: varchar().notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    phone: varchar(),
    homeRegionId: integer("home_region_id"),
    avatarUrl: varchar("avatar_url"),
    meta: json(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    emergencyContact: varchar("emergency_contact"),
    emergencyPhone: varchar("emergency_phone"),
    emergencyNotes: varchar("emergency_notes"),
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

export const eventCategories = pgTable("event_categories", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const eventTags = pgTable("event_tags", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  color: varchar(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
});

export const eventTypes = pgTable(
  "event_types",
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar(),
    acronym: varchar(),
    categoryId: integer("category_id").notNull(),
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [eventCategories.id],
      name: "event_types_category_id_fkey",
    }),
  ],
);

export const orgTypes = pgTable("org_types", {
  id: serial().primaryKey().notNull(),
  name: varchar().notNull(),
  description: varchar(),
  created: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updated: timestamp({ mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
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
    created: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updated: timestamp({ mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.slackTeamId],
      foreignColumns: [slackSpaces.teamId],
      name: "slack_users_slack_team_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "slack_users_user_id_fkey",
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

export const eventTagsXOrg = pgTable(
  "event_tags_x_org",
  {
    eventTagId: integer("event_tag_id").notNull(),
    orgId: integer("org_id").notNull(),
    colorOverride: varchar("color_override"),
  },
  (table) => [
    foreignKey({
      columns: [table.eventTagId],
      foreignColumns: [eventTags.id],
      name: "event_tags_x_org_event_tag_id_fkey",
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "event_tags_x_org_org_id_fkey",
    }),
    primaryKey({
      columns: [table.eventTagId, table.orgId],
      name: "event_tags_x_org_pkey",
    }),
  ],
);

export const eventTypesXOrg = pgTable(
  "event_types_x_org",
  {
    eventTypeId: integer("event_type_id").notNull(),
    orgId: integer("org_id").notNull(),
    isDefault: boolean("is_default").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventTypeId],
      foreignColumns: [eventTypes.id],
      name: "event_types_x_org_event_type_id_fkey",
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "event_types_x_org_org_id_fkey",
    }),
    primaryKey({
      columns: [table.eventTypeId, table.orgId],
      name: "event_types_x_org_pkey",
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
