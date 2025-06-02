import type { PartialBy } from "@acme/shared/common/types";
import type {
  RequestInsertType,
  UpdateLocationFormValues,
} from "@acme/validators";
import { RequestSchema } from "@acme/validators/request-schemas";

export const validateRequest = (
  values: PartialBy<UpdateLocationFormValues, "badImage">,
): RequestInsertType => {
  const request = RequestSchema.parse(values);
  return request;
};
