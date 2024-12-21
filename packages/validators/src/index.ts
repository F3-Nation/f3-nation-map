import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { schema } from "@f3/db";

// POST SCHEMA
export const EventInsertSchema = createInsertSchema(schema.events);
export const EventSelectSchema = createSelectSchema(schema.events);

export const CreateEventSchema = EventInsertSchema.omit({
  id: true,
  created: true,
  updated: true,
});
