import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { events, locations, orgs, users } from "@f3/db/schema/schema";
import { updateRequests } from "@f3/db/schema/update-requests";

// USER SCHEMA
export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);

export const CrupdateUserSchema = UserInsertSchema.extend({
  id: z.number(),
  regionIds: z.number().array(),
});
// AUTH SCHEMA
export const EmailAuthSchema = UserInsertSchema.pick({
  email: true,
}).extend({
  email: z.string().email(),
});

// REQUEST SCHEMA
export const UpdateRequestSelectSchema = createSelectSchema(updateRequests);

export const UpdateRequestFormSchema = z.object({
  id: z.string(),
  workoutName: z.string().min(1, { message: "Workout name is required" }),
  workoutWebsite: z.string().nullable(),
  aoLogo: z.string(),
  eventId: z.number(),
  locationId: z.number(),
  regionId: z.number().refine((value) => value !== -1, {
    message: "Please select a region",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  lat: z.number(),
  lng: z.number(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Start time must be in 24hr format (HH:MM)",
  }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "End time must be in 24hr format (HH:MM)",
  }),
  dayOfWeek: z.string(),
  eventTypes: z.array(z.object({ id: z.number(), name: z.string() })),
  eventDescription: z.string().min(1, { message: "Description is required" }),
  locationAddress: z.string().min(1, {
    message: "Location address is required",
  }),
  badImage: z.boolean().default(false),
});

// LOCATION SCHEMA
export const LocationInsertSchema = createInsertSchema(locations);
export const LocationSelectSchema = createSelectSchema(locations);

// EVENT SCHEMA
export const EventInsertSchema = createInsertSchema(events);
export const EventSelectSchema = createSelectSchema(events);

export const CreateEventSchema = EventInsertSchema.omit({
  id: true,
  created: true,
  updated: true,
});

// REGION SCHEMA
export const RegionInsertSchema = createInsertSchema(orgs);
export const RegionSelectSchema = createSelectSchema(orgs);
