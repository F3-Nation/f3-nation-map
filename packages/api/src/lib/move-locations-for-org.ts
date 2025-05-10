import { TRPCError } from "@trpc/server";

import { eq, inArray, schema } from "@acme/db";
import { isTruthy } from "@acme/shared/common/functions";

import type { Context } from "../trpc";

/**
 * Moves the locations for an org to a new parent org
 *
 * Example 1
 * AO 1 moves from region 1 to region 2,
 * We need to make a copy of the locations for AO 1's Event 1 and Event 2 to the new region
 * We need to move the Events to the new location
 * We need to delete the old locations if no events exist on it
 *
 * Example 2
 * Region 1 moves from Area 1 to Area 2
 * We don't need to move any locations because they would point to the region id, which didn't change
 */
export const moveLocationsForOrg = async (
  ctx: Context,
  input: {
    oldParentId: number;
    oldOrgId: number;
    newParentId: number;
  },
) => {
  const newLocationIds: number[] = [];
  console.log("moveLocationsForOrg", input);
  const { oldOrgId, newParentId } = input;

  // 1. If updating an ao to a new region,
  const orgEvents = await ctx.db
    .select()
    .from(schema.events)
    .where(eq(schema.events.orgId, oldOrgId));

  console.log("aoEvents", orgEvents.length);

  const orgEventIds = orgEvents.map((e) => e.id);

  const orgEventsLocationIds = orgEvents
    .map((e) => e.locationId)
    .filter(isTruthy);

  const aoEventsLocations = orgEventsLocationIds.length
    ? await ctx.db
        .select()
        .from(schema.locations)
        .where(inArray(schema.locations.id, orgEventsLocationIds))
    : [];

  console.log("aoEventsLocations", aoEventsLocations.length);

  for (const aoEventLocation of aoEventsLocations) {
    // 1a. duplicate the location in the new org
    const [newLocation] = await ctx.db
      .insert(schema.locations)
      .values({
        ...aoEventLocation,
        orgId: newParentId,
        id: undefined,
      })
      .returning();

    if (!newLocation) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create new location",
      });
    }
    newLocationIds.push(newLocation.id);
    console.log("created newLocation", newLocation.id);
    // 1b. move the ao's events to the new location
    await ctx.db
      .update(schema.events)
      .set({ locationId: newLocation.id })
      .where(inArray(schema.events.id, orgEventIds));

    console.log("moved events to new location", newLocation.id);

    const remainingLocationEvents = await ctx.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.locationId, aoEventLocation.id));

    console.log("remainingLocationEvents", remainingLocationEvents.length);

    if (!remainingLocationEvents?.length) {
      // 1c. Delete the old location if it has no other events
      await ctx.db
        .update(schema.locations)
        .set({ isActive: false })
        .where(eq(schema.locations.id, aoEventLocation.id));

      console.log("deleted old location", aoEventLocation.id);
    }
  }

  return { newLocationIds };
};
