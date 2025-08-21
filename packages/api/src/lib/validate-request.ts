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
  MoveAoToDifferentLocationSchema,
  MoveAoToDifferentRegionSchema,
  MoveAoToNewLocationSchema,
  MoveEventToDifferentAoSchema,
  MoveEventToNewLocationSchema,
  RequestSchema,
} from "@acme/validators/request-schemas";

export const validateRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): RequestInsertType => {
  const request = RequestSchema.parse(values);
  return request;
};

export const validateEditAoAndLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof EditAoAndLocationSchema> => {
  const request = EditAoAndLocationSchema.parse(values);
  return request;
};

export const validateEventEditRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof EditEventSchema> => {
  const request = EditEventSchema.parse(values);
  return request;
};

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
  const request = CreateLocationAndEventSchema.parse(values);
  return request;
};

export const validateMoveAOToNewLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveAoToNewLocationSchema> => {
  const request = MoveAoToNewLocationSchema.parse(values);
  return request;
};

export const validateMoveEventToNewLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveEventToNewLocationSchema> => {
  const request = MoveEventToNewLocationSchema.parse(values);
  return request;
};

export const validateMoveAOToDifferentLocationRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveAoToDifferentLocationSchema> => {
  const request = MoveAoToDifferentLocationSchema.parse(values);
  return request;
};

export const validateMoveAOToDifferentRegionRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveAoToDifferentRegionSchema> => {
  const request = MoveAoToDifferentRegionSchema.parse(values);
  return request;
};

export const validateMoveEventToDifferentAORequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): z.infer<typeof MoveEventToDifferentAoSchema> => {
  const request = MoveEventToDifferentAoSchema.parse(values);
  return request;
};
