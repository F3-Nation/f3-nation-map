import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import {
  events,
  locations,
  orgs,
  updateRequests,
  users,
} from "@f3/db/schema/schema";
import { DayOfWeek } from "@f3/shared/app/enums";

// USER SCHEMA
export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);

export const CrupdateUserSchema = UserInsertSchema.extend({
  id: z.number(),
  roles: z
    .object({
      orgId: z.number(),
      roleName: z.enum(["user", "editor", "admin"]),
    })
    .array(),
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
export const EventInsertSchema = createInsertSchema(events, {
  name: (s) => s.min(1, { message: "Name is required" }),
  orgId: (s) =>
    s
      .min(1, { message: "Please select an region" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  locationId: (s) =>
    s
      .min(1, { message: "Please select an location" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  email: (s) => s.email({ message: "Invalid email format" }),
  startTime: (s) =>
    s.regex(/^\d{4}$/, {
      message: "Start time must be in 24hr format (HHmm)",
    }),
  endTime: (s) =>
    s.regex(/^\d{4}$/, {
      message: "End time must be in 24hr format (HHmm)",
    }),
}).extend({
  regionId: z.number(),
});
export const EventSelectSchema = createSelectSchema(events);

export const CreateEventSchema = EventInsertSchema.omit({
  id: true,
  created: true,
  updated: true,
});

// NATION SCHEMA
export const NationInsertSchema = createInsertSchema(orgs, {
  name: (s) => s.min(1, { message: "Name is required" }),
  email: (s) => s.email({ message: "Invalid email format" }),
});
export const NationSelectSchema = createSelectSchema(orgs);

// SECTOR SCHEMA
export const SectorInsertSchema = createInsertSchema(orgs, {
  name: (s) => s.min(1, { message: "Name is required" }),
  parentId: (s) =>
    s
      .min(1, { message: "Please select a nation" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  email: (s) => s.email({ message: "Invalid email format" }),
});
export const SectorSelectSchema = createSelectSchema(orgs);

// AREA SCHEMA
export const AreaInsertSchema = createInsertSchema(orgs, {
  name: (s) => s.min(1, { message: "Name is required" }),
  parentId: (s) =>
    s
      .min(1, { message: "Please select a sector" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  email: (s) => s.email({ message: "Invalid email format" }),
});
export const AreaSelectSchema = createSelectSchema(orgs);

// REGION SCHEMA
export const RegionInsertSchema = createInsertSchema(orgs, {
  name: (s) => s.min(1, { message: "Name is required" }),
  parentId: (s) =>
    s
      .min(1, { message: "Please select an area" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  email: (s) => s.email({ message: "Invalid email format" }),
});
export const RegionSelectSchema = createSelectSchema(orgs);

// AO SCHEMA
export const AOInsertSchema = createInsertSchema(orgs, {
  name: (s) => s.min(1, { message: "Name is required" }),
  parentId: (s) =>
    s
      .min(1, { message: "Please select a region" })
      .refine((value) => value !== -1, { message: "Invalid selection" }),
  email: (s) => s.email({ message: "Invalid email format" }),
});
export const AOSelectSchema = createSelectSchema(orgs);

// REQUEST UPDATE SCHEMA
export const RequestInsertSchema = createInsertSchema(updateRequests, {
  eventTypeIds: (s) =>
    s.min(1, { message: "Please select at least one event type" }),
  eventName: (s) => s.min(1, { message: "Workout name is required" }),
  eventDescription: (s) => s.min(1, { message: "Description is required" }),
  eventDayOfWeek: z.enum(DayOfWeek, {
    message: "Day of the week is required",
  }),
  locationName: (s) => s.min(1, { message: "Location name is required" }),
  locationAddress: (s) => s.min(1, { message: "Location address is required" }),
  locationCity: (s) => s.min(1, { message: "Location city is required" }),
  locationState: (s) => s.min(1, { message: "Location state is required" }),
  locationZip: (s) => s.min(1, { message: "Location zip is required" }),
  locationCountry: (s) => s.min(1, { message: "Location country is required" }),
  regionId: z
    .number({
      required_error: "Region is required",
      message: "Region is required",
      invalid_type_error: "Region is required",
      description: "Region is required",
    })
    .min(0, { message: "Region is required" }),
  eventStartTime: (s) =>
    s.regex(/^\d{4}$/, {
      message: "Start time must be in 24hr format (HHmm)",
    }),
  eventEndTime: (s) =>
    s.regex(/^\d{4}$/, {
      message: "End time must be in 24hr format (HHmm)",
    }),
  submittedBy: (s) => s.email({ message: "Invalid email address" }),
}).extend({
  id: z.string(),
  regionId: z.number(),
});

export const UpdateRequestSelectSchema = createSelectSchema(updateRequests);
