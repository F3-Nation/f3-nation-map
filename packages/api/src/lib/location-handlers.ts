import { eq } from "drizzle-orm";

import { schema } from "@acme/db";

import type { Context } from "../trpc";
import type { UpdateRequestData } from "./types";

/**
 * Insert a new location into the database
 */
export const insertLocation = async (
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
export const updateLocation = async (
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
