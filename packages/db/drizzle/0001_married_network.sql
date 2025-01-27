CREATE TABLE "next_auth_accounts" (
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
	CONSTRAINT "next_auth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "next_auth_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "next_auth_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "next_auth_verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp,
	CONSTRAINT "next_auth_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "update_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"org_id" integer,
	"event_id" integer,
	"event_type" varchar(30),
	"event_tag" varchar(30),
	"event_series_id" integer,
	"event_is_series" boolean,
	"event_is_active" boolean,
	"event_highlight" boolean,
	"event_start_date" date,
	"event_end_date" date,
	"event_start_time" time,
	"event_end_time" time,
	"event_day_of_week" varchar(30),
	"event_name" varchar(100) NOT NULL,
	"event_description" text,
	"event_recurrence_pattern" varchar(30),
	"event_recurrence_interval" integer,
	"event_index_within_interval" integer,
	"event_meta" json,
	"location_name" text,
	"location_description" text,
	"location_lat" numeric(8, 5),
	"location_lon" numeric(8, 5),
	"location_id" integer,
	"submitted_by" text,
	"submitter_validated" boolean DEFAULT false,
	"validated_by" text,
	"validated_at" timestamp,
	"meta" json,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
--> statement-breakpoint
ALTER TABLE "next_auth_accounts" ADD CONSTRAINT "next_auth_accounts_userId_next_auth_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."next_auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "next_auth_sessions" ADD CONSTRAINT "next_auth_sessions_userId_next_auth_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."next_auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;