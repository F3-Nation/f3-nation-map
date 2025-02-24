ALTER TABLE "auth_verification_token" RENAME TO "auth_verification_tokens";--> statement-breakpoint
ALTER TABLE "auth_accounts" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "auth_sessions" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "auth_accounts" DROP CONSTRAINT "auth_accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_sessions" DROP CONSTRAINT "auth_sessions_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "slack_users" DROP CONSTRAINT "slack_users_slack_team_id_fkey";
--> statement-breakpoint
ALTER TABLE "update_requests" DROP CONSTRAINT "update_requests_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "update_requests" DROP CONSTRAINT "update_requests_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "update_requests" DROP CONSTRAINT "update_requests_region_id_orgs_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "type" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "provider" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "provider_account_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "refresh_token" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "access_token" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "token_type" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "scope" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "auth_accounts" ALTER COLUMN "id_token" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "token" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "region_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_tag" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_start_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_end_time" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_description" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_description" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "submitted_by" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "submitter_validated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "reviewed_by" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "created" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "created" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "updated" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "updated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "event_contact_email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_address" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_address2" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_city" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "location_contact_email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "ao_logo" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "update_requests" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_userId_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_requests" ADD CONSTRAINT "update_requests_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;