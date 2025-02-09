CREATE TYPE "public"."update_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "update_requests" RENAME COLUMN "org_id" TO "region_id";--> statement-breakpoint
ALTER TABLE "update_requests" RENAME COLUMN "location_lon" TO "location_lng";--> statement-breakpoint
ALTER TABLE "update_requests" RENAME COLUMN "validated_by" TO "reviewed_by";--> statement-breakpoint
ALTER TABLE "update_requests" RENAME COLUMN "validated_at" TO "reviewed_at";--> statement-breakpoint
ALTER TABLE "update_requests" DROP CONSTRAINT "update_requests_org_id_orgs_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "event_contact_email" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_address" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_address2" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_city" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_state" varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_zip" varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_country" varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "location_contact_email" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "ao_logo" text;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "status" "update_request_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_region_id_orgs_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;