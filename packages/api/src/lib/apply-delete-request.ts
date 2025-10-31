import omit from "lodash/omit";

import type {
  DeleteRequestResponse,
  DeleteRequestType,
} from "@acme/validators";
import { eq, inArray, schema } from "@acme/db";

import type { Context } from "../trpc";

export const applyDeleteRequest = async (
  ctx: Context,
  deleteRequest: DeleteRequestType & { reviewedBy: string },
): Promise<DeleteRequestResponse> => {
  const regionId = deleteRequest.originalRegionId;
  if (!regionId) {
    throw new Error("Region id is required");
  }

  console.log("deleteRequest", deleteRequest);

  // Delete event and all event types associated with it
  if (deleteRequest.eventId != undefined) {
    await ctx.db
      .delete(schema.eventsXEventTypes)
      .where(eq(schema.eventsXEventTypes.eventId, deleteRequest.eventId));
    await ctx.db
      .update(schema.events)
      .set({ isActive: false })
      .where(eq(schema.events.id, deleteRequest.eventId));

    // Delete location and all events associated with it
  } else if (deleteRequest.originalLocationId != undefined) {
    await ctx.db
      .update(schema.locations)
      .set({ isActive: false })
      .where(eq(schema.locations.id, deleteRequest.originalLocationId));

    // Delete AO and all events associated with it
  } else if (deleteRequest.originalAoId != undefined) {
    await ctx.db
      .update(schema.orgs)
      .set({ isActive: false })
      .where(eq(schema.orgs.id, deleteRequest.originalAoId));
    const eventsToDelete = await ctx.db
      .select({ eventId: schema.events.id })
      .from(schema.events)
      .where(eq(schema.events.orgId, deleteRequest.originalAoId));

    await ctx.db.delete(schema.eventsXEventTypes).where(
      inArray(
        schema.eventsXEventTypes.eventId,
        eventsToDelete.map((e) => e.eventId),
      ),
    );
    await ctx.db
      .update(schema.events)
      .set({ isActive: false })
      .where(
        inArray(
          schema.events.id,
          eventsToDelete.map((e) => e.eventId),
        ),
      );
  } else {
    throw new Error("Nothing to delete");
  }

  return {
    status: "approved" as const,
    deleteRequest: omit({ ...deleteRequest, regionId }, ["token"]),
  };
};
