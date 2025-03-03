CREATE TYPE "public"."request_type" AS ENUM('create-location', 'create-event', 'edit', 'delete-event');--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "request_type" "request_type" DEFAULT 'edit' NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "request_type" DROP DEFAULT;