ALTER TABLE "auth_accounts" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_time" SET DATA TYPE varchar(4);--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_time" SET DATA TYPE varchar(4);--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_start_time" SET DATA TYPE varchar(4);--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_end_time" SET DATA TYPE varchar(4);--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_recurrence_pattern" SET DATA TYPE event_cadence USING event_recurrence_pattern::event_cadence;--> statement-breakpoint
ALTER TABLE "public"."events" ALTER COLUMN "day_of_week" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."update_requests" ALTER COLUMN "event_day_of_week" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."day_of_week";--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');--> statement-breakpoint
ALTER TABLE "public"."events" ALTER COLUMN "day_of_week" SET DATA TYPE "public"."day_of_week" USING "day_of_week"::"public"."day_of_week";--> statement-breakpoint
ALTER TABLE "public"."update_requests" ALTER COLUMN "event_day_of_week" SET DATA TYPE "public"."day_of_week" USING "event_day_of_week"::"public"."day_of_week";