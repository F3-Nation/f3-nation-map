CREATE TABLE IF NOT EXISTS "f3_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer,
	"attendance_type_id" integer NOT NULL,
	"is_planned" boolean NOT NULL,
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_attendance_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_next_auth_accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"created" timestamp DEFAULT now(),
	"updated" timestamp,
	CONSTRAINT "f3_next_auth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_next_auth_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_next_auth_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_next_auth_verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp,
	CONSTRAINT "f3_next_auth_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_event_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_event_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(30),
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_event_tags_x_org" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_tag_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"color_override" varchar(30),
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_event_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"description" text,
	"acronym" varchar(30),
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_event_types_x_org" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"is_default" boolean NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer,
	"location_id" integer,
	"event_type_id" integer,
	"event_tag_id" integer,
	"series_id" integer,
	"is_series" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"highlight" boolean NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"day_of_week" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"recurrence_pattern" varchar(30),
	"recurrence_interval" integer,
	"index_within_interval" integer,
	"pax_count" integer,
	"fng_count" integer,
	"preblast" text,
	"backblast" text,
	"preblast_rich" json,
	"backblast_rich" json,
	"preblast_ts" integer,
	"backblast_ts" integer,
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean NOT NULL,
	"lat" numeric(8, 5),
	"lon" numeric(8, 5),
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_org_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_orgs" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"org_type_id" integer NOT NULL,
	"default_location_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean NOT NULL,
	"logo" text,
	"website" varchar(255),
	"email" varchar(255),
	"twitter" varchar(100),
	"facebook" varchar(100),
	"instagram" varchar(100),
	"slack_id" varchar(30),
	"slack_app_settings" json,
	"last_annual_review" date,
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_slack_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"slack_id" varchar(100) NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_admin" boolean NOT NULL,
	"user_id" integer NOT NULL,
	"avatar_url" varchar(255),
	"slack_team_id" varchar(100) NOT NULL,
	"strava_access_token" varchar(100),
	"strava_refresh_token" varchar(100),
	"strava_expires_at" timestamp,
	"strava_athlete_id" integer,
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "f3_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"f3_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"home_region_id" integer,
	"avatar_url" varchar(255),
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp,
	CONSTRAINT "f3_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_attendance" ADD CONSTRAINT "f3_attendance_event_id_f3_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."f3_events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_attendance" ADD CONSTRAINT "f3_attendance_user_id_f3_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."f3_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_attendance" ADD CONSTRAINT "f3_attendance_attendance_type_id_f3_attendance_types_id_fk" FOREIGN KEY ("attendance_type_id") REFERENCES "public"."f3_attendance_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_next_auth_accounts" ADD CONSTRAINT "f3_next_auth_accounts_userId_f3_next_auth_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."f3_next_auth_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_next_auth_sessions" ADD CONSTRAINT "f3_next_auth_sessions_userId_f3_next_auth_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."f3_next_auth_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_event_tags_x_org" ADD CONSTRAINT "f3_event_tags_x_org_event_tag_id_f3_event_tags_id_fk" FOREIGN KEY ("event_tag_id") REFERENCES "public"."f3_event_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_event_tags_x_org" ADD CONSTRAINT "f3_event_tags_x_org_org_id_f3_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_event_types" ADD CONSTRAINT "f3_event_types_category_id_f3_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."f3_event_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_event_types_x_org" ADD CONSTRAINT "f3_event_types_x_org_event_type_id_f3_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."f3_event_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_event_types_x_org" ADD CONSTRAINT "f3_event_types_x_org_org_id_f3_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_events" ADD CONSTRAINT "f3_events_org_id_f3_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_events" ADD CONSTRAINT "f3_events_location_id_f3_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."f3_locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_events" ADD CONSTRAINT "f3_events_event_type_id_f3_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."f3_event_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_events" ADD CONSTRAINT "f3_events_event_tag_id_f3_event_tags_id_fk" FOREIGN KEY ("event_tag_id") REFERENCES "public"."f3_event_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_events" ADD CONSTRAINT "events_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."f3_events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_locations" ADD CONSTRAINT "f3_locations_org_id_f3_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_orgs" ADD CONSTRAINT "f3_orgs_org_type_id_f3_org_types_id_fk" FOREIGN KEY ("org_type_id") REFERENCES "public"."f3_org_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_orgs" ADD CONSTRAINT "orgs_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_slack_users" ADD CONSTRAINT "f3_slack_users_user_id_f3_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."f3_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_users" ADD CONSTRAINT "f3_users_home_region_id_f3_orgs_id_fk" FOREIGN KEY ("home_region_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "event_user" ON "f3_attendance" USING btree ("event_id","user_id","attendance_type_id","is_planned");