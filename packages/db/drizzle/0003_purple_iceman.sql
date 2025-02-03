ALTER TABLE "locations" RENAME COLUMN "lat" TO "latitude";--> statement-breakpoint
ALTER TABLE "locations" RENAME COLUMN "lon" TO "longitude";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_event_type_id_fkey";
--> statement-breakpoint
ALTER TABLE "slack_users" ADD CONSTRAINT "slack_users_slack_team_id_fkey" FOREIGN KEY ("slack_team_id") REFERENCES "public"."slack_spaces"("team_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "event_type_id";--> statement-breakpoint
ALTER TABLE "orgs" DROP COLUMN "logo";