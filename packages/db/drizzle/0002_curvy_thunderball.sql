CREATE TABLE IF NOT EXISTS "f3_update_requests" (
	"id" serial PRIMARY KEY NOT NULL,
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
DROP TABLE "f3_expansion_users";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_update_requests" ADD CONSTRAINT "f3_update_requests_org_id_f3_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."f3_orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_update_requests" ADD CONSTRAINT "f3_update_requests_event_id_f3_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."f3_events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "f3_update_requests" ADD CONSTRAINT "f3_update_requests_location_id_f3_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."f3_locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
