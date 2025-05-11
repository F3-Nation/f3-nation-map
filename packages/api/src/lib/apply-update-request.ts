import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { omit } from "lodash";

import type { DayOfWeek } from "@acme/shared/app/enums";
import type { EventMeta, UpdateRequestMeta } from "@acme/shared/app/types";
import type { RequestInsertType } from "@acme/validators";
import { schema } from "@acme/db";

import type { Context } from "../trpc";
import { moveLocationsForOrg } from "./move-locations-for-org";

/**
 * Interface representing response from an update request operation
 */
interface UpdateRequestResponse {
  status: "approved" | "pending" | "rejected";
  updateRequest: Omit<typeof schema.updateRequests.$inferSelect, "token">;
}

type UpdateRequestData = Omit<
  RequestInsertType,
  "meta" | "eventMeta" | "eventDayOfWeek"
> & {
  reviewedBy: string;
  meta?: UpdateRequestMeta | null;
  eventMeta?: EventMeta | null;
  eventDayOfWeek?: DayOfWeek | null;
};

/**
 * Insert a new location into the database
 */
const insertLocation = async (
  ctx: Context,
  updateRequest: UpdateRequestData,
) => {
  const newLocation: typeof schema.locations.$inferInsert = {
    name: updateRequest.locationName ?? "",
    description: updateRequest.locationDescription ?? "",
    addressStreet: updateRequest.locationAddress ?? "",
    addressStreet2: updateRequest.locationAddress2 ?? "",
    addressCity: updateRequest.locationCity ?? "",
    addressState: updateRequest.locationState ?? "",
    addressZip: updateRequest.locationZip ?? "",
    addressCountry: updateRequest.locationCountry ?? "",
    latitude: updateRequest.locationLat ?? 0,
    longitude: updateRequest.locationLng ?? 0,
    orgId: updateRequest.regionId,
    email: updateRequest.locationContactEmail ?? undefined,
    isActive: true,
  };

  const [location] = await ctx.db
    .insert(schema.locations)
    .values(newLocation)
    .returning();

  if (!location) {
    throw new Error("Failed to insert location");
  }
  return location;
};

/**
 * Update an existing location
 */
const updateLocation = async (
  ctx: Context,
  updateRequest: UpdateRequestData & { locationId: number },
) => {
  const [location] = await ctx.db
    .update(schema.locations)
    .set({
      description: updateRequest.locationDescription ?? undefined,
      addressStreet: updateRequest.locationAddress ?? undefined,
      addressStreet2: updateRequest.locationAddress2 ?? undefined,
      addressCity: updateRequest.locationCity ?? undefined,
      addressState: updateRequest.locationState ?? undefined,
      addressZip: updateRequest.locationZip ?? undefined,
      addressCountry: updateRequest.locationCountry ?? undefined,
      latitude: updateRequest.locationLat ?? undefined,
      longitude: updateRequest.locationLng ?? undefined,
      email: updateRequest.locationContactEmail ?? undefined,
    })
    .where(eq(schema.locations.id, updateRequest.locationId))
    .returning();

  if (!location) {
    throw new Error("Failed to update location");
  }

  return location;
};

/**
 * Creates or updates a location based on request data
 */
export const handleLocation = async (
  ctx: Context,
  updateRequest: UpdateRequestData,
): Promise<number> => {
  // If no locationId, create a new location
  if (updateRequest.locationId == undefined) {
    const location = await insertLocation(ctx, updateRequest);
    return location.id;
  } else {
    // Otherwise update existing location
    await updateLocation(ctx, {
      ...updateRequest,
      locationId: updateRequest.locationId,
    });
    return updateRequest.locationId;
  }
};

/**
 * Creates a new AO using the provided data
 */
const createAO = async (
  ctx: Context,
  {
    regionId,
    locationId,
    aoName,
    aoWebsite,
    aoLogo,
  }: {
    regionId?: number;
    locationId?: number | null;
    aoName?: string;
    aoWebsite?: string | null;
    aoLogo?: string | null;
  },
): Promise<number> => {
  console.log("inserting ao", { regionId, locationId, aoName });
  const [ao] = await ctx.db
    .insert(schema.orgs)
    .values({
      parentId: regionId,
      orgType: "ao",
      website: aoWebsite ?? undefined,
      defaultLocationId: locationId ?? undefined,
      name: aoName ?? "",
      isActive: true,
      logoUrl: aoLogo ?? undefined,
    })
    .returning();

  if (!ao) throw new Error("Failed to insert AO");
  return ao.id;
};

/**
 * Updates an existing AO with the provided data
 */
const updateAO = async (
  ctx: Context,
  {
    aoId,
    regionId,
    locationId,
    aoName,
    aoWebsite,
    aoLogo,
  }: {
    aoId: number;
    regionId?: number;
    locationId?: number | null;
    aoName?: string | null;
    aoWebsite?: string | null;
    aoLogo?: string | null;
  },
): Promise<void> => {
  const [ao] = await ctx.db
    .select()
    .from(schema.orgs)
    .where(eq(schema.orgs.id, aoId));

  if (!ao) {
    throw new Error("Failed to find ao to update. Does the AO exist?");
  }

  if (ao?.orgType !== "ao") {
    throw new Error("Organization is not an AO");
  }

  await ctx.db
    .update(schema.orgs)
    .set({
      parentId: regionId ?? ao.parentId,
      website: aoWebsite ?? ao.website,
      defaultLocationId: locationId ?? ao.defaultLocationId,
      name: aoName ?? ao.name,
      logoUrl: aoLogo ?? ao.logoUrl,
    })
    .where(eq(schema.orgs.id, aoId));
};

/**
 * Moves an AO to a different region and handles updating locations
 */
export const moveAOToRegion = async (
  ctx: Context,
  {
    aoId,
    oldParentId,
    newParentId,
  }: {
    aoId: number;
    oldParentId: number;
    newParentId: number;
  },
): Promise<{ newLocationIds: number[] }> => {
  return await moveLocationsForOrg(ctx, {
    oldParentId,
    oldOrgId: aoId,
    newParentId,
  });
};

const updateEvent = async (
  ctx: Context,
  updateRequest: {
    eventId: number;
    eventName?: string | null;
    eventDescription?: string | null;
    eventStartDate?: string | null;
    eventEndDate?: string | null;
    eventStartTime?: string | null;
    eventEndTime?: string | null;
    eventDayOfWeek?: DayOfWeek | null;
    eventSeriesId?: number | null;
    eventRecurrencePattern?: "weekly" | "monthly" | null;
    eventRecurrenceInterval?: number | null;
    eventIndexWithinInterval?: number | null;
    eventMeta?: EventMeta | null;
    eventContactEmail?: string | null;
    aoId?: number | null;
  },
  locationId: number,
) => {
  // Update existing event
  const [updated] = await ctx.db
    .update(schema.events)
    .set({
      name: updateRequest.eventName ?? undefined,
      locationId,
      description: updateRequest.eventDescription ?? undefined,
      startDate: updateRequest.eventStartDate ?? undefined,
      endDate: updateRequest.eventEndDate ?? undefined,
      startTime: updateRequest.eventStartTime ?? undefined,
      endTime: updateRequest.eventEndTime ?? undefined,
      dayOfWeek: updateRequest.eventDayOfWeek ?? undefined,
      seriesId: updateRequest.eventSeriesId ?? undefined,
      isActive: true,
      highlight: false,
      orgId: updateRequest.aoId ?? undefined,
      recurrencePattern: updateRequest.eventRecurrencePattern ?? undefined,
      recurrenceInterval: updateRequest.eventRecurrenceInterval ?? undefined,
      indexWithinInterval: updateRequest.eventIndexWithinInterval ?? undefined,
      meta: updateRequest.eventMeta ?? undefined,
      email: updateRequest.eventContactEmail ?? undefined,
    })
    .where(eq(schema.events.id, updateRequest.eventId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update event");
  }

  return updated;
};

const insertEvent = async (
  ctx: Context,
  updateRequest: {
    eventId?: never;
    eventName: string;
    eventDescription?: string | null;
    eventStartDate: string;
    eventEndDate?: string | null;
    eventStartTime?: string | null;
    eventEndTime?: string | null;
    eventDayOfWeek?: DayOfWeek | null;
    eventSeriesId?: number | null;
    eventRecurrencePattern?: "weekly" | "monthly" | null;
    eventRecurrenceInterval?: number | null;
    eventIndexWithinInterval?: number | null;
    eventMeta?: EventMeta | null;
    eventContactEmail?: string | null;
    aoId: number;
  },
  locationId: number,
) => {
  // Update existing event
  const newEvent: typeof schema.events.$inferInsert = {
    name: updateRequest.eventName,
    locationId,
    description: updateRequest.eventDescription ?? undefined,
    startDate: updateRequest.eventStartDate,
    endDate: updateRequest.eventEndDate ?? undefined,
    startTime: updateRequest.eventStartTime ?? undefined,
    endTime: updateRequest.eventEndTime ?? undefined,
    dayOfWeek: updateRequest.eventDayOfWeek ?? undefined,
    seriesId: updateRequest.eventSeriesId ?? undefined,
    isActive: true,
    highlight: false,
    orgId: updateRequest.aoId,
    recurrencePattern: updateRequest.eventRecurrencePattern ?? undefined,
    recurrenceInterval: updateRequest.eventRecurrenceInterval ?? undefined,
    indexWithinInterval: updateRequest.eventIndexWithinInterval ?? undefined,
    meta: updateRequest.eventMeta ?? undefined,
    email: updateRequest.eventContactEmail ?? undefined,
  };

  const [event] = await ctx.db
    .insert(schema.events)
    .values(newEvent)
    .returning();

  if (!event) {
    throw new Error("Failed to insert event");
  }

  return event;
};

/**
 * Updates or creates an event based on request data
 */
const handleEvent = async (
  ctx: Context,
  updateRequest: UpdateRequestData,
  locationId: number,
): Promise<number> => {
  let eventId: number | undefined = updateRequest.eventId ?? undefined;

  if (eventId) {
    // Update existing event
    const updated = await updateEvent(
      ctx,
      { ...updateRequest, eventId },
      locationId,
    );
    eventId = updated.id;
  } else {
    const aoId = updateRequest.aoId ?? undefined;
    if (!aoId) {
      throw new Error("AO ID is required to create an event");
    }

    if (!updateRequest.eventName) {
      throw new Error("Event name is required to create an event");
    }

    // Create new event
    const values = {
      ...updateRequest,
      eventId: undefined, // remove eventId from the values
      eventStartDate:
        updateRequest.eventStartDate ?? dayjs().format("YYYY-MM-DD"),
      eventName: updateRequest.eventName ?? "",
      aoId,
    };
    const event = await insertEvent(ctx, values, locationId);
    eventId = event.id;
  }

  return eventId;
};

/**
 * Updates event types for an event
 */
const updateEventTypes = async (
  ctx: Context,
  {
    eventId,
    eventTypeIds,
  }: {
    eventId: number;
    eventTypeIds?: number[] | null;
  },
): Promise<void> => {
  // Delete existing event types
  await ctx.db
    .delete(schema.eventsXEventTypes)
    .where(eq(schema.eventsXEventTypes.eventId, eventId));

  // Add new event types if provided
  if (eventTypeIds?.length) {
    await ctx.db.insert(schema.eventsXEventTypes).values(
      eventTypeIds.map((id) => ({
        eventId,
        eventTypeId: id,
      })),
    );
  }
};

/**
 * Records an update request in the database
 */
const recordUpdateRequest = async (
  ctx: Context,
  updateRequest: UpdateRequestData,
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
 * Master function that handles all aspects of an update request
 */
export const applyUpdateRequest = async (
  ctx: Context,
  updateRequest: UpdateRequestData,
): Promise<UpdateRequestResponse> => {
  // Only needed if we move the ao to a new region
  // Have to keep track of the new location id so we can update the event with the new location id
  let regionChangeNewLocationId: number | undefined;

  // Handle location
  const locationId: number = await handleLocation(ctx, updateRequest);

  // Handle AO
  if (updateRequest.aoId == undefined) {
    if (!updateRequest.aoName) {
      throw new Error("AO name is required to create an AO");
    }

    // Insert new AO
    updateRequest.aoId = await createAO(ctx, {
      regionId: updateRequest.regionId,
      locationId: locationId,
      aoName: updateRequest.aoName,
      aoWebsite: updateRequest.aoWebsite,
      aoLogo: updateRequest.aoLogo,
    });
  } else {
    // Get existing AO to check if region is changing
    const [ao] = await ctx.db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.id, updateRequest.aoId));

    if (ao?.orgType !== "ao") {
      throw new Error("Failed to find ao to update. Does the AO exist?");
    }

    // If region is changing, handle location moves
    if (updateRequest.regionId !== ao.parentId && ao.parentId !== null) {
      const { newLocationIds } = await moveAOToRegion(ctx, {
        aoId: updateRequest.aoId,
        oldParentId: ao.parentId,
        newParentId: updateRequest.regionId ?? 0,
      });

      const [newLocationId] = newLocationIds;
      if (!newLocationId) {
        throw new Error("Failed to move locations for org");
      }
      regionChangeNewLocationId = newLocationId;
    }

    // Update the AO
    await updateAO(ctx, {
      aoId: updateRequest.aoId,
      regionId: updateRequest.regionId,
      locationId: updateRequest.locationId,
      aoName: updateRequest.aoName,
      aoWebsite: updateRequest.aoWebsite,
      aoLogo: updateRequest.aoLogo,
    });
  }

  // Record the update request
  const updatedRequest = await recordUpdateRequest(ctx, updateRequest);

  // Handle event creation/updating
  // Use the new location ID from region change if available
  const effectiveLocationId = regionChangeNewLocationId ?? locationId;

  if (updateRequest.eventId !== undefined || updateRequest.eventName) {
    const eventId = await handleEvent(ctx, updateRequest, effectiveLocationId);

    // Update event types
    await updateEventTypes(ctx, {
      eventId,
      eventTypeIds: updateRequest.eventTypeIds,
    });
  }

  return {
    status: "approved",
    updateRequest: omit(updatedRequest, ["token"]),
  };
};
