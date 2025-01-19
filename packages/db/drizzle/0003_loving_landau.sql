CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE "f3_events" DROP CONSTRAINT "events_series_id_fkey";
--> statement-breakpoint
ALTER TABLE "f3_update_requests" 
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE uuid USING (uuid_generate_v4()),
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();