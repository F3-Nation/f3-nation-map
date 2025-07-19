import { omit } from "lodash";

import type { RequestType } from "@acme/shared/app/enums";
import { and, eq, schema } from "@acme/db";

import type { Context } from "../trpc";
import type {
  UpdateRequestDataWithRequiredRegionId,
  UpdateRequestResponse,
} from "./types";
import { createAO, getLocationIdsForAO, updateAO } from "./ao-handlers";
import { handleEvent, updateEvent, updateEventTypes } from "./event-handlers";
import { handleLocation, updateLocation } from "./location-handlers";

/**
 * Records an update request in the database
 */
export const recordUpdateRequest = async (
  ctx: Context,
  updateRequest: Omit<
    Partial<UpdateRequestDataWithRequiredRegionId>,
    "reviewedBy"
  > & {
    regionId: number;
    submittedBy: string;
    requestType: RequestType;
    reviewedBy?: string | null;
  },
): Promise<typeof schema.updateRequests.$inferSelect> => {
  const updateRequestInsertData: typeof schema.updateRequests.$inferInsert = {
    ...updateRequest,
    status: "approved",
    reviewedAt: new Date().toISOString(),
  };

  const [updated] = await ctx.db
    .insert(schema.updateRequests)
    .values(updateRequestInsertData)
    .onConflictDoUpdate({
      target: [schema.updateRequests.id],
      set: updateRequestInsertData,
    })
    .returning();

  if (!updated) {
    throw new Error("Failed to update request record");
  }

  return updated;
};

/**
 * Handler for CREATE_LOCATION_AND_EVENT request type
 */
export const handleCreateLocationAndEvent = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  // 1. Create location
  const locationId = await handleLocation(ctx, request);

  // 2. Create AO
  if (!request.aoName) {
    throw new Error("AO name is required to create an AO");
  }

  const aoId = await createAO(ctx, {
    regionId: request.regionId,
    locationId,
    aoName: request.aoName,
    aoWebsite: request.aoWebsite,
    aoLogo: request.aoLogo,
  });

  request.aoId = aoId;

  // 3. Create event
  const eventId = await handleEvent(ctx, request, locationId);

  // 4. Update event types
  await updateEventTypes(ctx, {
    eventId,
    eventTypeIds: request.eventTypeIds,
  });

  // 5. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for CREATE_EVENT request type
 */
export const handleCreateEvent = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.originalAoId) {
    throw new Error("AO ID is required to create an event");
  }

  // 1. Get the location ID for the AO
  const [locationId] = await getLocationIdsForAO(ctx, request.originalAoId);
  if (!locationId) {
    throw new Error("AO does not have any locations");
  }

  // 2. Create event
  const eventId = await handleEvent(ctx, request, locationId);

  // 3. Update event types
  await updateEventTypes(ctx, {
    eventId,
    eventTypeIds: request.eventTypeIds,
  });

  // 4. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for EDIT_EVENT request type
 */
export const handleEditEvent = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.eventId) {
    throw new Error("Event ID is required to edit an event");
  }

  // 1. Get the event to get the location ID
  const [event] = await ctx.db
    .select()
    .from(schema.events)
    .where(eq(schema.events.id, request.eventId));

  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.locationId) {
    throw new Error("Event does not have a location");
  }

  // 2. Update the event
  await updateEvent(
    ctx,
    { ...request, eventId: request.eventId },
    event.locationId,
  );

  // 3. Update event types if provided
  if (request.eventTypeIds) {
    await updateEventTypes(ctx, {
      eventId: request.eventId,
      eventTypeIds: request.eventTypeIds,
    });
  }

  // 4. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for EDIT_AO_AND_LOCATION request type
 */
export const handleEditAOAndLocation = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.originalAoId) {
    throw new Error("AO ID is required to edit an AO");
  }

  // 1. Get the location ID for the AO
  const [locationId] = await getLocationIdsForAO(ctx, request.originalAoId);
  if (!locationId) {
    throw new Error("AO does not have any locations");
  }

  // 2. Update the location
  await updateLocation(ctx, {
    ...request,
    locationId,
  });

  // 3. Update the AO
  await updateAO(ctx, {
    id: request.originalAoId,
    name: request.aoName ?? undefined, // this can't be removed
    website: request.aoWebsite,
    logoUrl: request.aoLogo,
  });

  // 4. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for MOVE_AO_TO_DIFFERENT_REGION request type
 */
export const handleMoveAOToDifferentRegion = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  console.log("handleMoveAOToDifferentRegion", request);
  if (!request.originalAoId) {
    throw new Error("AO ID is required to move an AO");
  }

  if (!request.regionId) {
    throw new Error("Target region ID is required");
  }

  const [ao] = await ctx.db
    .select()
    .from(schema.orgs)
    .where(
      and(
        eq(schema.orgs.id, request.originalAoId),
        eq(schema.orgs.orgType, "ao"),
      ),
    );

  if (!ao) {
    throw new Error("AO not found");
  }

  const originalRegionId = ao.parentId;
  if (originalRegionId !== request.originalRegionId) {
    throw new Error("AO is not in the original region");
  }

  if (originalRegionId === request.regionId) {
    throw new Error("AO is already in the target region");
  }

  if (!originalRegionId) {
    throw new Error("AO does not have a region");
  }

  // 1. Move the AO to the new region & Update the AO's parentId
  const { newLocationIds } = await updateAO(ctx, {
    id: request.originalAoId,
    parentId: request.regionId,
    defaultLocationId: request.locationId,
    name: request.aoName ?? undefined,
    website: request.aoWebsite,
    logoUrl: request.aoLogo,
  });

  // 2. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
    newLocationIds,
  };
};

/**
 * Handler for MOVE_AO_TO_NEW_LOCATION request type
 */
export const handleMoveAOToNewLocation = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.aoId) {
    throw new Error("AO ID is required to move an AO");
  }

  // 1. Create the new location
  const locationId = await handleLocation(ctx, request);

  // 2. Update the AO's default location
  await updateAO(ctx, {
    id: request.aoId,
    defaultLocationId: locationId,
  });

  // 3. Update all the AO's events to use the new location
  const events = await ctx.db
    .select()
    .from(schema.events)
    .where(eq(schema.events.orgId, request.aoId));

  for (const event of events) {
    await ctx.db
      .update(schema.events)
      .set({ locationId })
      .where(eq(schema.events.id, event.id));
  }

  // 4. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for MOVE_AO_TO_DIFFERENT_LOCATION request type
 */
export const handleMoveAOToDifferentLocation = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.aoId) {
    throw new Error("AO ID is required to move an AO");
  }

  if (!request.locationId) {
    throw new Error("Target location ID is required");
  }

  // 1. Update the AO's default location
  await updateAO(ctx, {
    id: request.aoId,
    defaultLocationId: request.locationId,
  });

  // 2. Update all the AO's events to use the new location
  const events = await ctx.db
    .select()
    .from(schema.events)
    .where(eq(schema.events.orgId, request.aoId));

  for (const event of events) {
    await ctx.db
      .update(schema.events)
      .set({ locationId: request.locationId })
      .where(eq(schema.events.id, event.id));
  }

  // 3. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for MOVE_EVENT_TO_DIFFERENT_AO request type
 */
export const handleMoveEventToDifferentAo = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.eventId) {
    throw new Error("Event ID is required to move an event");
  }

  if (!request.originalAoId) {
    throw new Error("Target AO ID is required");
  }

  // 1. Get the location ID for the AO
  const [locationId] = await getLocationIdsForAO(ctx, request.originalAoId);
  if (!locationId) {
    throw new Error("AO does not have any locations");
  }

  // 2. Update the event
  await updateEvent(
    ctx,
    { ...request, eventId: request.eventId, aoId: request.originalAoId },
    locationId,
  );

  // 3. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for MOVE_EVENT_TO_NEW_LOCATION request type
 */
export const handleMoveEventToNewLocation = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  if (!request.eventId) {
    throw new Error("Event ID is required to move an event");
  }

  // 1. Create the new location
  const locationId = await handleLocation(ctx, request);

  // 2. Update the event
  await updateEvent(ctx, { ...request, eventId: request.eventId }, locationId);

  // 3. Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};

/**
 * Handler for legacy EDIT request type
 */
export const handleLegacyEdit = async (
  ctx: Context,
  request: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  // Only needed if we move the ao to a new region
  // Have to keep track of the new location id so we can update the event with the new location id
  let regionChangeNewLocationId: number | undefined;

  // Handle location
  const locationId: number = await handleLocation(ctx, request);

  // Handle AO
  if (request.aoId == undefined) {
    if (!request.aoName) {
      throw new Error("AO name is required to create an AO");
    }

    // Insert new AO
    request.aoId = await createAO(ctx, {
      regionId: request.regionId,
      locationId: locationId,
      aoName: request.aoName,
      aoWebsite: request.aoWebsite,
      aoLogo: request.aoLogo,
    });
  } else {
    // Get existing AO to check if region is changing
    const [ao] = await ctx.db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.id, request.aoId));

    if (ao?.orgType !== "ao") {
      throw new Error("Failed to find ao to update. Does the AO exist?");
    }

    // Update the AO
    await updateAO(ctx, {
      id: request.aoId,
      parentId: request.regionId,
      defaultLocationId: request.locationId,
      name: request.aoName ?? undefined,
      website: request.aoWebsite,
      logoUrl: request.aoLogo,
    });
  }

  // Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, request);

  // Handle event creation/updating
  // Use the new location ID from region change if available
  const effectiveLocationId = regionChangeNewLocationId ?? locationId;

  if (request.eventId !== undefined || request.eventName) {
    const eventId = await handleEvent(ctx, request, effectiveLocationId);

    // Update event types
    await updateEventTypes(ctx, {
      eventId,
      eventTypeIds: request.eventTypeIds,
    });
  }

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};
