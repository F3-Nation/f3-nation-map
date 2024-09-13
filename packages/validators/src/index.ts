import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { schema } from "@f3/db";

// POST SCHEMA
//@ts-expect-error -- old types
export const EventInsertSchema = createInsertSchema(schema.events);
//@ts-expect-error -- old types
export const EventSelectSchema = createSelectSchema(schema.events);

export const CreateEventSchema = EventInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
