ALTER TABLE "public"."events" ALTER COLUMN "day_of_week" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."update_requests" ALTER COLUMN "event_day_of_week" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."day_of_week";--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
ALTER TABLE "public"."events" ALTER COLUMN "day_of_week" SET DATA TYPE "public"."day_of_week" USING "day_of_week"::"public"."day_of_week";--> statement-breakpoint
ALTER TABLE "public"."update_requests" ALTER COLUMN "event_day_of_week" SET DATA TYPE "public"."day_of_week" USING "event_day_of_week"::"public"."day_of_week";