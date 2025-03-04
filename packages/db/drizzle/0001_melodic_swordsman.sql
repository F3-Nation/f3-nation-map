CREATE INDEX "idx_events_location_id" ON "events" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_events_org_id" ON "events" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_events_is_active" ON "events" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_events_x_event_types_event_id" ON "events_x_event_types" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_events_x_event_types_event_type_id" ON "events_x_event_types" USING btree ("event_type_id");--> statement-breakpoint
CREATE INDEX "idx_locations_org_id" ON "locations" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_locations_name" ON "locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_locations_is_active" ON "locations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_orgs_parent_id" ON "orgs" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_orgs_org_type" ON "orgs" USING btree ("org_type");--> statement-breakpoint
CREATE INDEX "idx_orgs_is_active" ON "orgs" USING btree ("is_active");