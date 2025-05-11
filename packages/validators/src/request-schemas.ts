import { z } from "zod";

import { DayOfWeek, RequestType } from "@acme/shared/app/enums";

// Common fields that appear in most request types
export const CommonFields = {
  id: z.string(),
  submittedBy: z.string().email("Please enter a valid email address"),
  badImage: z.boolean().default(false),
};

// Event-related fields
export const EventFields = {
  eventId: z.number().nullable(),
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  eventDayOfWeek: z.enum(DayOfWeek),
  eventStartTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Start time must be in format HH:MM (e.g., 05:30)",
  }),
  eventEndTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "End time must be in format HH:MM (e.g., 06:30)",
  }),
  eventDescription: z.string().optional(),
  eventTypeIds: z
    .array(z.number())
    .min(1, "At least one event type is required"),
};

// AO-related fields
export const AOFields = {
  aoId: z.number().nullable(),
  aoName: z.string().min(2, "AO name must be at least 2 characters"),
  aoLogo: z.string().url("Must be a valid URL").optional().nullable(),
  aoWebsite: z.string().url("Must be a valid URL").optional().nullable(),
};

// Location-related fields
export const LocationFields = {
  locationId: z.number().nullable(),
  locationLat: z.number(),
  locationLng: z.number(),
  locationAddress: z.string().min(5, "Address must be at least 5 characters"),
  locationAddress2: z.string().optional().nullable(),
  locationCity: z.string().min(2, "City must be at least 2 characters"),
  locationState: z.string().min(2, "State must be at least 2 characters"),
  locationZip: z.string().min(3, "ZIP code must be at least 3 characters"),
  locationCountry: z.string().min(2, "Country must be at least 2 characters"),
  locationDescription: z.string().optional().nullable(),
};

// Region-related fields
export const RegionFields = {
  regionId: z.number(),
  originalRegionId: z.number().optional(),
};

// Tracking fields for move operations
export const TrackingFields = {
  originalAoId: z.number().nullable().optional(),
  originalLocationId: z.number().nullable().optional(),
};

// Base schema with common fields
const BaseSchema = z.object({
  ...CommonFields,
});

// CREATE LOCATION AND EVENT (create_location_and_event)
export const CreateLocationAndEventSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[0]),
  ...EventFields,
  ...AOFields,
  ...LocationFields,
  ...RegionFields,
});

// CREATE EVENT (create_event)
export const CreateEventSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[1]),
  ...EventFields,
  aoId: z.number().positive("AO ID is required"),
});

// EDIT EVENT (edit-event)
export const EditEventSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[2]),
  eventId: z.number().positive("Event ID is required"),
  eventName: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .optional(),
  eventDayOfWeek: z.enum(DayOfWeek).optional(),
  eventStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "Start time must be in format HH:MM (e.g., 05:30)",
    })
    .optional(),
  eventEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "End time must be in format HH:MM (e.g., 06:30)",
    })
    .optional(),
  eventDescription: z.string().optional(),
  eventTypeIds: z.array(z.number()).optional(),
});

// EDIT AO AND LOCATION (edit-ao-and-location)
export const EditAoAndLocationSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[3]),
  ...AOFields,
  aoName: z.string().min(2, "AO name must be at least 2 characters").optional(),
  ...LocationFields,
  locationAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional(),
  locationCity: z
    .string()
    .min(2, "City must be at least 2 characters")
    .optional(),
  locationState: z
    .string()
    .min(2, "State must be at least 2 characters")
    .optional(),
  locationZip: z
    .string()
    .min(3, "ZIP code must be at least 3 characters")
    .optional(),
  locationCountry: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .optional(),
});

// MOVE AO TO DIFFERENT REGION (move_ao_to_different_region)
export const MoveAoToDifferentRegionSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[4]),
  aoId: z.number().positive("AO ID is required"),
  regionId: z.number().positive("Target region ID is required"),
  originalRegionId: z.number().positive("Original region ID is required"),
});

// MOVE AO TO NEW LOCATION (move_ao_to_new_location)
export const MoveAoToNewLocationSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[5]),
  aoId: z.number().positive("AO ID is required"),
  ...LocationFields,
});

// MOVE AO TO DIFFERENT LOCATION (move_ao_to_different_location)
export const MoveAoToDifferentLocationSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[6]),
  aoId: z.number().positive("AO ID is required"),
  locationId: z.number().positive("Target location ID is required"),
  originalLocationId: z.number().positive("Original location ID is required"),
});

// MOVE EVENT TO DIFFERENT AO (move_event_to_different_ao)
export const MoveEventToDifferentAoSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[7]),
  eventId: z.number().positive("Event ID is required"),
  aoId: z.number().positive("Target AO ID is required"),
  originalAoId: z.number().positive("Original AO ID is required"),
});

// MOVE EVENT TO NEW LOCATION (move_event_to_new_location)
export const MoveEventToNewLocationSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[8]),
  eventId: z.number().positive("Event ID is required"),
  ...LocationFields,
});

// DELETE EVENT (delete_event)
export const DeleteEventSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[9]),
  eventId: z.number().positive("Event ID is required"),
});

// DELETE AO (delete_ao)
export const DeleteAoSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[10]),
  aoId: z.number().positive("AO ID is required"),
});

// LEGACY EDIT (edit)
export const LegacyEditSchema = BaseSchema.extend({
  requestType: z.literal(RequestType[11]),
  ...EventFields,
  eventName: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .optional(),
  eventDayOfWeek: z.enum(DayOfWeek).optional(),
  eventStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "Start time must be in format HH:MM (e.g., 05:30)",
    })
    .optional(),
  eventEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "End time must be in format HH:MM (e.g., 06:30)",
    })
    .optional(),
  eventTypeIds: z.array(z.number()).optional(),
  ...AOFields,
  aoName: z.string().min(2, "AO name must be at least 2 characters").optional(),
  ...LocationFields,
  locationAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional(),
  locationCity: z
    .string()
    .min(2, "City must be at least 2 characters")
    .optional(),
  locationState: z
    .string()
    .min(2, "State must be at least 2 characters")
    .optional(),
  locationZip: z
    .string()
    .min(3, "ZIP code must be at least 3 characters")
    .optional(),
  locationCountry: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .optional(),
  ...RegionFields,
  regionId: z.number().optional(),
  ...TrackingFields,
});

// Combined schema that can validate any request type
export const RequestSchema = z.discriminatedUnion("requestType", [
  CreateLocationAndEventSchema,
  CreateEventSchema,
  EditEventSchema,
  EditAoAndLocationSchema,
  MoveAoToDifferentRegionSchema,
  MoveAoToNewLocationSchema,
  MoveAoToDifferentLocationSchema,
  MoveEventToDifferentAoSchema,
  MoveEventToNewLocationSchema,
  DeleteEventSchema,
  DeleteAoSchema,
  LegacyEditSchema,
]);

// Export all schemas
export const RequestSchemas = {
  CreateLocationAndEvent: CreateLocationAndEventSchema,
  CreateEvent: CreateEventSchema,
  EditEvent: EditEventSchema,
  EditAoAndLocation: EditAoAndLocationSchema,
  MoveAoToDifferentRegion: MoveAoToDifferentRegionSchema,
  MoveAoToNewLocation: MoveAoToNewLocationSchema,
  MoveAoToDifferentLocation: MoveAoToDifferentLocationSchema,
  MoveEventToDifferentAo: MoveEventToDifferentAoSchema,
  MoveEventToNewLocation: MoveEventToNewLocationSchema,
  DeleteEvent: DeleteEventSchema,
  DeleteAo: DeleteAoSchema,
  LegacyEdit: LegacyEditSchema,
};

// Type for the parsed result
export type RequestSchemaType = z.infer<typeof RequestSchema>;
