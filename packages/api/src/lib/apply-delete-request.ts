import type { z } from "zod";
import omit from "lodash/omit";

import type {
  DeleteRequestResponse,
  RequestInsertSchema,
} from "@acme/validators";
import { eq, schema } from "@acme/db";

import type { Context } from "../trpc";

export const applyDeleteRequest = async (
  ctx: Context,
  deleteRequest: Partial<z.infer<typeof RequestInsertSchema>>,
): Promise<DeleteRequestResponse> => {
  if (deleteRequest.eventId != undefined) {
    await ctx.db
      .delete(schema.eventsXEventTypes)
      .where(eq(schema.eventsXEventTypes.eventId, deleteRequest.eventId));
    await ctx.db
      .update(schema.events)
      .set({ isActive: false })
      .where(eq(schema.events.id, deleteRequest.eventId));
  } else if (deleteRequest.locationId != undefined) {
    await ctx.db
      .update(schema.locations)
      .set({ isActive: false })
      .where(eq(schema.locations.id, deleteRequest.locationId));
  } else {
    throw new Error("Nothing to delete");
  }

  return {
    status: "approved" as const,
    deleteRequest: omit(deleteRequest, ["token"]),
  };
};
