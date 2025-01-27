ALTER TABLE "events" ADD COLUMN "event_type_id" integer;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE no action ON UPDATE no action;