import type { z } from "zod";

import type { PartialBy } from "@acme/shared/common/types";
import type {
  RequestInsertType,
  UpdateLocationFormValues,
} from "@acme/validators";
import {
  CreateEventSchema,
  CreateLocationAndEventSchema,
  EditAoAndLocationSchema,
  EditEventSchema,
  MoveAoToNewLocationSchema,
  MoveEventToNewLocationSchema,
  RequestSchema,
} from "@acme/validators/request-schemas";

export const validateRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): RequestInsertType => {
  const request = RequestSchema.parse(values);
  return request;
};

// TODO: probably need to update the EditAoAndLocationSchema
export const validateEditAoAndLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof EditAoAndLocationSchema> => {
  const request = EditAoAndLocationSchema.parse(values);
  return request;
};

// TODO: probably need to update the EditEventSchema
export const validateEventEditRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof EditEventSchema> => {
  const request = EditEventSchema.parse(values);
  return request;
};

// TODO: probably need to update the CreateEventSchema
export const validateCreateEventRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof CreateEventSchema> => {
  const request = CreateEventSchema.parse(values);
  return request;
};

// Validation function for CREATE_LOCATION_AND_EVENT requests
export const validateCreateLocationAndEventRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof CreateLocationAndEventSchema> => {
  console.log("validateCreateLocationAndEventRequest", values);
  const request = CreateLocationAndEventSchema.parse(values);
  return request;
};

// Validation function for MOVE_AO_TO_NEW_LOCATION requests
export const validateMoveAOToNewLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveAoToNewLocationSchema> => {
  const request = MoveAoToNewLocationSchema.parse(values);
  return request;
};

// Validation function for MOVE_EVENT_TO_NEW_LOCATION requests
export const validateMoveEventToNewLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveEventToNewLocationSchema> => {
  const request = MoveEventToNewLocationSchema.parse(values);
  return request;
};
