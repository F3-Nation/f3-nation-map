ALTER TABLE "auth_accounts" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_token" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_token" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attendance_types" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "attendance_types" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event_categories" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "event_categories" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event_tags" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "event_tags" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event_types" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "event_types" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "expansions" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "expansions" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "org_types" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "org_types" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orgs" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orgs" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "slack_spaces" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "slack_spaces" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "slack_users" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "slack_users" ALTER COLUMN "updated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_lat" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_lng" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated" DROP DEFAULT;