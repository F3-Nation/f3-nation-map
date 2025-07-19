import { z } from "zod";

import { DayOfWeek } from "@acme/shared/app/enums";

import { RequestInsertSchema } from ".";

// Event-related fields
export const EventFields = z.object({
  eventId: z.number().optional().nullable(),
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  eventDayOfWeek: z.enum(DayOfWeek),
  eventStartTime: z.string().regex(/^\d{4}$/, {
    message: "Start time must be in 24hr format (HHmm)",
  }),
  eventEndTime: z.string().regex(/^\d{4}$/, {
    message: "End time must be in 24hr format (HHmm)",
  }),
  eventDescription: z.string().optional(),
  eventTypeIds: z
    .array(z.number())
    .min(1, "At least one event type is required"),
});

// AO-related fields
export const AOFields = z.object({
  aoId: z.number().nullable(),
  aoName: z.string().min(2, "AO name must be at least 2 characters"),
  aoLogo: z.string().url("Must be a valid URL").optional().nullable(),
  aoWebsite: z.string().url("Must be a valid URL").optional().nullable(),
});

// Location-related fields
export const LocationFields = z.object({
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
});

// Region-related fields
export const RegionFields = z.object({
  regionId: z.number(),
});

// Tracking fields for move operations
export const TrackingFields = z.object({
  originalAoId: z.number().nullable(),
  originalLocationId: z.number().nullable(),
});

// Base schema with common fields
const BaseSchema = RequestInsertSchema.pick({
  id: true,
  originalRegionId: true,
  originalAoId: true,
  originalLocationId: true,
  regionId: true,
  requestType: true,
  submittedBy: true,
  reviewedBy: true,
});

// CREATE LOCATION AND EVENT (create_location_and_event)
export const CreateLocationAndEventSchema = BaseSchema.extend({
  requestType: z.literal("create_location_and_event"),
})
  .merge(EventFields)
  .merge(AOFields)
  .merge(LocationFields)
  .merge(RegionFields);

// CREATE EVENT (create_event)
export const CreateEventSchema = BaseSchema.extend({
  requestType: z.literal("create_event"),
  originalAoId: z.number().positive("AO ID is required"),
}).merge(EventFields);

// EDIT EVENT (edit-event)
export const EditEventSchema = BaseSchema.extend({
  requestType: z.literal("edit_event"),
}).merge(EventFields.partial());

// EDIT AO AND LOCATION (edit-ao-and-location)
export const EditAoAndLocationSchema = BaseSchema.extend({
  requestType: z.literal("edit_ao_and_location"),
})
  .merge(AOFields.partial())
  .merge(LocationFields.partial());

// MOVE AO TO DIFFERENT REGION (move_ao_to_different_region)
export const MoveAoToDifferentRegionSchema = BaseSchema.extend({
  requestType: z.literal("move_ao_to_different_region"),
  regionId: z.number().positive("Target region ID is required"),
  originalAoId: z.number().positive("Original AO ID is required"),
  originalRegionId: z.number().positive("Original region ID is required"),
});

// MOVE AO TO NEW LOCATION (move_ao_to_new_location)
export const MoveAoToNewLocationSchema = BaseSchema.extend({
  requestType: z.literal("move_ao_to_new_location"),
  aoId: z.number().positive("AO ID is required"),
}).merge(LocationFields);

// MOVE AO TO DIFFERENT LOCATION (move_ao_to_different_location)
export const MoveAoToDifferentLocationSchema = BaseSchema.extend({
  requestType: z.literal("move_ao_to_different_location"),
  aoId: z.number().positive("AO ID is required"),
  locationId: z.number().positive("Target location ID is required"),
  originalLocationId: z.number().positive("Original location ID is required"),
});

// MOVE EVENT TO DIFFERENT AO (move_event_to_different_ao)
export const MoveEventToDifferentAoSchema = BaseSchema.extend({
  requestType: z.literal("move_event_to_different_ao"),
  eventId: z.number().positive("Event ID is required"),
  aoId: z.number().positive("Target AO ID is required"),
  originalAoId: z.number().positive("Original AO ID is required"),
});

// MOVE EVENT TO NEW LOCATION (move_event_to_new_location)
export const MoveEventToNewLocationSchema = BaseSchema.extend({
  requestType: z.literal("move_event_to_new_location"),
  eventId: z.number().positive("Event ID is required"),
}).merge(LocationFields.omit({ locationId: true }));

// DELETE EVENT (delete_event)
export const DeleteEventSchema = BaseSchema.extend({
  requestType: z.literal("delete_event"),
  eventId: z.number().positive("Event ID is required"),
});

// DELETE AO (delete_ao)
export const DeleteAoSchema = BaseSchema.extend({
  requestType: z.literal("delete_ao"),
  aoId: z.number().positive("AO ID is required"),
});

// LEGACY EDIT (edit)
export const LegacyEditSchema = BaseSchema.extend({
  requestType: z.literal("edit"),
})
  .merge(EventFields.partial())
  .merge(AOFields.partial())
  .merge(LocationFields.partial())
  .merge(RegionFields)
  .merge(TrackingFields);

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
