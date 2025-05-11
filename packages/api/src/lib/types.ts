import type { schema } from "@acme/db";
import type { DayOfWeek } from "@acme/shared/app/enums";
import type { EventMeta, UpdateRequestMeta } from "@acme/shared/app/types";
import type { RequestInsertType } from "@acme/validators";

/**
 * Interface representing response from an update request operation
 */
export interface UpdateRequestResponse {
  status: "approved" | "pending" | "rejected";
  updateRequest: Omit<typeof schema.updateRequests.$inferSelect, "token">;
}

export type UpdateRequestData = Omit<
  RequestInsertType,
  "meta" | "eventMeta" | "eventDayOfWeek"
> & {
  reviewedBy: string;
  meta?: UpdateRequestMeta | null;
  eventMeta?: EventMeta | null;
  eventDayOfWeek?: DayOfWeek | null;
};
