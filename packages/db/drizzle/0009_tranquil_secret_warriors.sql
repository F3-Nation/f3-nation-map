/* DO NOT DROP AND RECREATE THIS MIGRATION. IT USES CUSTOM CODE */
/* DO NOT DROP AND RECREATE THIS MIGRATION. IT USES CUSTOM CODE */
/* DO NOT DROP AND RECREATE THIS MIGRATION. IT USES CUSTOM CODE */


CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "public"."event_cadence" AS ENUM('weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('first_f', 'second_f', 'third_f');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('ao', 'region', 'area', 'sector', 'nation');--> statement-breakpoint
ALTER TABLE "achievements_x_org" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "org_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "achievements_x_org" CASCADE;--> statement-breakpoint
DROP TABLE "event_categories" CASCADE;--> statement-breakpoint
DROP TABLE "org_types" CASCADE;--> statement-breakpoint
/* ALTER TABLE "event_types" DROP CONSTRAINT "event_types_category_id_fkey"; */
--> statement-breakpoint
/* ALTER TABLE "orgs" DROP CONSTRAINT "orgs_org_type_id_fkey"; */
--> statement-breakpoint
/* ALTER TABLE "positions" DROP CONSTRAINT "positions_org_type_id_fkey"; */
--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "attendance_types" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "attendance_types" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_token" ALTER COLUMN "created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_token" ALTER COLUMN "updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_tags" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "event_tags" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "event_types" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "event_types" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "day_of_week";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "day_of_week" day_of_week;--> statement-breakpoint
ALTER TABLE "update_requests" DROP COLUMN "event_day_of_week";--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "event_day_of_week" day_of_week;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "recurrence_pattern";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_pattern" event_cadence;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "expansions" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "expansions" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "orgs" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "orgs" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "slack_spaces" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "slack_spaces" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "slack_users" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "slack_users" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "region_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_start_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_end_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_day_of_week" SET DATA TYPE day_of_week;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_lat" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_lng" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "created" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "specific_org_id" integer;--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "event_category" "event_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "org_type" "org_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "org_type" "org_type";--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_specific_org_id_fkey" FOREIGN KEY ("specific_org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_types" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "orgs" DROP COLUMN "org_type_id";--> statement-breakpoint
ALTER TABLE "positions" DROP COLUMN "org_type_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";