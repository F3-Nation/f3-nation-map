CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"verb" varchar NOT NULL,
	"image_url" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements_x_org" (
	"achievement_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	CONSTRAINT "achievements_x_org_pkey" PRIMARY KEY("achievement_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "achievements_x_users" (
	"achievement_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"date_awarded" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "achievements_x_users_pkey" PRIMARY KEY("achievement_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "alembic_version" (
	"version_num" varchar(32) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_planned" boolean NOT NULL,
	"meta" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "attendance_event_id_user_id_is_planned_key" UNIQUE("event_id","user_id","is_planned")
);
--> statement-breakpoint
CREATE TABLE "attendance_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"description" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_x_attendance_types" (
	"attendance_id" integer NOT NULL,
	"attendance_type_id" integer NOT NULL,
	CONSTRAINT "attendance_x_attendance_types_pkey" PRIMARY KEY("attendance_id","attendance_type_id")
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"color" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tags_x_events" (
	"event_id" integer NOT NULL,
	"event_tag_id" integer NOT NULL,
	CONSTRAINT "event_tags_x_events_pkey" PRIMARY KEY("event_id","event_tag_id")
);
--> statement-breakpoint
CREATE TABLE "event_tags_x_org" (
	"event_tag_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"color_override" varchar,
	CONSTRAINT "event_tags_x_org_pkey" PRIMARY KEY("event_tag_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "event_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"acronym" varchar,
	"category_id" integer NOT NULL,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_types_x_org" (
	"event_type_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"is_default" boolean NOT NULL,
	CONSTRAINT "event_types_x_org_pkey" PRIMARY KEY("event_type_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"location_id" integer,
	"series_id" integer,
	"is_series" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"highlight" boolean NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"day_of_week" integer,
	"name" varchar NOT NULL,
	"description" varchar,
	"recurrence_pattern" varchar,
	"recurrence_interval" integer,
	"index_within_interval" integer,
	"pax_count" integer,
	"fng_count" integer,
	"preblast" varchar,
	"backblast" varchar,
	"preblast_rich" json,
	"backblast_rich" json,
	"preblast_ts" double precision,
	"backblast_ts" double precision,
	"meta" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events_x_event_types" (
	"event_id" integer NOT NULL,
	"event_type_id" integer NOT NULL,
	CONSTRAINT "events_x_event_types_pkey" PRIMARY KEY("event_id","event_type_id")
);
--> statement-breakpoint
CREATE TABLE "expansions" (
	"id" serial PRIMARY KEY NOT NULL,
	"area" varchar NOT NULL,
	"pinned_lat" double precision NOT NULL,
	"pinned_lon" double precision NOT NULL,
	"user_lat" double precision NOT NULL,
	"user_lon" double precision NOT NULL,
	"interested_in_organizing" boolean NOT NULL,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expansions_x_users" (
	"expansion_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"request_date" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"notes" varchar,
	CONSTRAINT "expansions_x_users_pkey" PRIMARY KEY("expansion_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"is_active" boolean NOT NULL,
	"lat" double precision,
	"lon" double precision,
	"address_street" varchar,
	"address_city" varchar,
	"address_state" varchar,
	"address_zip" varchar,
	"address_country" varchar,
	"meta" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magiclinkauthrecord" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"otp_hash" "bytea" NOT NULL,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"expiration" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"client_ip" varchar NOT NULL,
	"recent_attempts" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magiclinkauthsession" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"persistent_id" varchar NOT NULL,
	"session_token" varchar NOT NULL,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"expiration" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"org_type_id" integer NOT NULL,
	"default_location_id" integer,
	"name" varchar NOT NULL,
	"description" varchar,
	"is_active" boolean NOT NULL,
	"logo_url" varchar,
	"website" varchar,
	"email" varchar,
	"twitter" varchar,
	"facebook" varchar,
	"instagram" varchar,
	"last_annual_review" date,
	"meta" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orgs_x_slack_spaces" (
	"org_id" integer NOT NULL,
	"slack_space_id" integer NOT NULL,
	CONSTRAINT "orgs_x_slack_spaces_pkey" PRIMARY KEY("org_id","slack_space_id")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"org_type_id" integer,
	"org_id" integer,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions_x_orgs_x_users" (
	"position_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "positions_x_orgs_x_users_pkey" PRIMARY KEY("position_id","org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles_x_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "roles_x_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles_x_users_x_org" (
	"role_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	CONSTRAINT "roles_x_users_x_org_pkey" PRIMARY KEY("role_id","user_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "slack_spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" varchar NOT NULL,
	"workspace_name" varchar,
	"bot_token" varchar,
	"settings" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "slack_spaces_team_id_key" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "slack_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"slack_id" varchar NOT NULL,
	"user_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"is_admin" boolean NOT NULL,
	"is_owner" boolean NOT NULL,
	"is_bot" boolean NOT NULL,
	"user_id" integer,
	"avatar_url" varchar,
	"slack_team_id" varchar NOT NULL,
	"strava_access_token" varchar,
	"strava_refresh_token" varchar,
	"strava_expires_at" timestamp,
	"strava_athlete_id" integer,
	"meta" json,
	"slack_updated" timestamp,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"f3_name" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"home_region_id" integer,
	"avatar_url" varchar,
	"meta" json,
	"created" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"emergency_contact" varchar,
	"emergency_phone" varchar,
	"emergency_notes" varchar,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "achievements_x_org" ADD CONSTRAINT "achievements_x_org_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements_x_org" ADD CONSTRAINT "achievements_x_org_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements_x_users" ADD CONSTRAINT "achievements_x_users_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements_x_users" ADD CONSTRAINT "achievements_x_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_x_attendance_types" ADD CONSTRAINT "attendance_x_attendance_types_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_x_attendance_types" ADD CONSTRAINT "attendance_x_attendance_types_attendance_type_id_fkey" FOREIGN KEY ("attendance_type_id") REFERENCES "public"."attendance_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags_x_events" ADD CONSTRAINT "event_tags_x_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags_x_events" ADD CONSTRAINT "event_tags_x_events_event_tag_id_fkey" FOREIGN KEY ("event_tag_id") REFERENCES "public"."event_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags_x_org" ADD CONSTRAINT "event_tags_x_org_event_tag_id_fkey" FOREIGN KEY ("event_tag_id") REFERENCES "public"."event_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags_x_org" ADD CONSTRAINT "event_tags_x_org_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_types" ADD CONSTRAINT "event_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_types_x_org" ADD CONSTRAINT "event_types_x_org_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_types_x_org" ADD CONSTRAINT "event_types_x_org_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_x_event_types" ADD CONSTRAINT "events_x_event_types_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_x_event_types" ADD CONSTRAINT "events_x_event_types_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expansions_x_users" ADD CONSTRAINT "expansions_x_users_expansion_id_fkey" FOREIGN KEY ("expansion_id") REFERENCES "public"."expansions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expansions_x_users" ADD CONSTRAINT "expansions_x_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_org_type_id_fkey" FOREIGN KEY ("org_type_id") REFERENCES "public"."org_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs_x_slack_spaces" ADD CONSTRAINT "orgs_x_slack_spaces_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs_x_slack_spaces" ADD CONSTRAINT "orgs_x_slack_spaces_slack_space_id_fkey" FOREIGN KEY ("slack_space_id") REFERENCES "public"."slack_spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_org_type_id_fkey" FOREIGN KEY ("org_type_id") REFERENCES "public"."org_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions_x_orgs_x_users" ADD CONSTRAINT "positions_x_orgs_x_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions_x_orgs_x_users" ADD CONSTRAINT "positions_x_orgs_x_users_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions_x_orgs_x_users" ADD CONSTRAINT "positions_x_orgs_x_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_x_permissions" ADD CONSTRAINT "roles_x_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_x_permissions" ADD CONSTRAINT "roles_x_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_x_users_x_org" ADD CONSTRAINT "roles_x_users_x_org_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_x_users_x_org" ADD CONSTRAINT "roles_x_users_x_org_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_x_users_x_org" ADD CONSTRAINT "roles_x_users_x_org_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slack_users" ADD CONSTRAINT "slack_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_home_region_id_fkey" FOREIGN KEY ("home_region_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;