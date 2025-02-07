ALTER TABLE "event_tags_x_org" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_types_x_org" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "magiclinkauthrecord" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "magiclinkauthsession" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "event_tags_x_org" CASCADE;--> statement-breakpoint
DROP TABLE "event_types_x_org" CASCADE;--> statement-breakpoint
DROP TABLE "magiclinkauthrecord" CASCADE;--> statement-breakpoint
DROP TABLE "magiclinkauthsession" CASCADE;--> statement-breakpoint
ALTER TABLE "event_tags" ADD COLUMN "specific_org_id" integer;--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "specific_org_id" integer;--> statement-breakpoint
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_specific_org_id_fkey" FOREIGN KEY ("specific_org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_types" ADD CONSTRAINT "event_types_specific_org_id_fkey" FOREIGN KEY ("specific_org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;