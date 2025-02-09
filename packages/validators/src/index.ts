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

// REQUEST UPDATE SCHEMA
export const RequestInsertSchema = createInsertSchema(updateRequests, {
  eventTypeIds: (s) =>
    s.min(1, { message: "Please select at least one event type" }),
  eventName: (s) => s.min(1, { message: "Workout name is required" }),
  eventDescription: (s) => s.min(1, { message: "Description is required" }),
  locationAddress: (s) => s.min(1, { message: "Location address is required" }),
  locationCity: (s) => s.min(1, { message: "Location city is required" }),
  locationState: (s) => s.min(1, { message: "Location state is required" }),
  locationZip: (s) => s.min(1, { message: "Location zip is required" }),
  locationCountry: (s) => s.min(1, { message: "Location country is required" }),
  regionId: (s) =>
    s.refine((value) => value !== -1, { message: "Please select a region" }),
  eventStartTime: (s) =>
    s.regex(/^\d{2}:\d{2}$/, {
      message: "Start time must be in 24hr format (HH:MM)",
    }),
  eventEndTime: (s) =>
    s.regex(/^\d{2}:\d{2}$/, {
      message: "End time must be in 24hr format (HH:MM)",
    }),
  submittedBy: (s) => s.email({ message: "Invalid email address" }),
}).extend({
  id: z.string(),
  regionId: z.number(),
});

export const UpdateRequestSelectSchema = createSelectSchema(updateRequests);
