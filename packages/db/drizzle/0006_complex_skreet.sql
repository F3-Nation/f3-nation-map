CREATE TYPE "public"."region_role" AS ENUM('user', 'editor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'editor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "name";
ALTER TABLE "roles" ADD COLUMN "name" region_role;
ALTER TABLE "update_requests" ALTER COLUMN "submitted_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ADD COLUMN "event_type_ids" integer[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" DROP COLUMN "event_type";