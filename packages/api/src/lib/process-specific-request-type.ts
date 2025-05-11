/* eslint-disable no-case-declarations */
import type { Session } from "@acme/auth";
import type { AppDb } from "@acme/db/client";
import type { RequestInsertType } from "@acme/validators";
import { RequestInsertSchema } from "@acme/validators";

const CreateEventSchema = RequestInsertSchema.pick({
  eventStartTime: true,
  eventEndTime: true,
});
const CreateLocationSchema = RequestInsertSchema.pick({});

const EditSchema = RequestInsertSchema.pick({
  eventStartTime: true,
  eventEndTime: true,
});
const EditAOAndLocationSchema = RequestInsertSchema.pick({});
const EditEventSchema = RequestInsertSchema.pick({
  eventStartTime: true,
  eventEndTime: true,
});

const MoveAOToDifferentLocationSchema = RequestInsertSchema.pick({});
const MoveAOToDifferentRegionSchema = RequestInsertSchema.pick({});
const MoveAOToNewLocationSchema = RequestInsertSchema.pick({});
const MoveEventToDifferentAO = RequestInsertSchema.pick({});
const MoveEventToNewAO = RequestInsertSchema.pick({});

const DeleteAOSchema = RequestInsertSchema.pick({});
const DeleteEventSchema = RequestInsertSchema.pick({});

export const processSpecificSchema = (params: {
  input: RequestInsertType;
  ctx: {
    db: AppDb;
    session: Session;
  };
}) => {
  switch (params.input.requestType) {
    case "create_event":
      const createEventData = CreateEventSchema.parse(_input);

      if (createEventData.eventStartTime && createEventData.eventEndTime) {
        if (createEventData.eventStartTime > createEventData.eventEndTime) {
          throw new Error("End time must be after start time");
        }
      }

      break;
    case "create_location_and_event":
      const createLocationData = CreateLocationSchema.parse(_input);
      break;

    case "edit":
      const editData = EditSchema.parse(_input);
      if (editData.eventStartTime && editData.eventEndTime) {
        if (editData.eventStartTime > editData.eventEndTime) {
          throw new Error("End time must be after start time");
        }
      }

      break;
    case "edit-ao-and-location":
      const editAOAndLocationData = EditAOAndLocationSchema.parse(_input);
      break;
    case "edit-event":
      const editEventData = EditEventSchema.parse(_input);
      break;

    case "move_ao_to_different_location":
      const moveAOToDifferentLocationData =
        MoveAOToDifferentLocationSchema.parse(_input);
      break;
    case "move_ao_to_different_region":
      const moveAOToDifferentRegionData =
        MoveAOToDifferentRegionSchema.parse(_input);
      break;
    case "move_ao_to_new_location":
      const moveAOToNewLocationData = MoveAOToNewLocationSchema.parse(_input);
      break;
    case "move_event_to_different_ao":
      const moveEventToDifferentAOData = MoveEventToDifferentAO.parse(_input);
      break;
    case "move_event_to_new_location":
      const moveEventToNewAOData = MoveEventToNewAO.parse(_input);
      break;

    case "delete_ao":
      const deleteAOData = DeleteAOSchema.parse(_input);
      break;
    case "delete_event":
      const deleteEventData = DeleteEventSchema.parse(_input);
      break;
  }
};
