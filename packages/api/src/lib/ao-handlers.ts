import { eq } from "drizzle-orm";

import { inArray, schema } from "@acme/db";
import { isTruthy } from "@acme/shared/common/functions";

import type { Context } from "../trpc";
import { moveLocationsForOrg } from "./move-locations-for-org";

/**
 * Creates a new AO using the provided data
 */
export const createAO = async (
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
  console.log("createAO", { regionId, locationId, aoName });
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
export const updateAO = async (
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

export const getLocationIdsForAO = async (ctx: Context, aoId: number) => {
  const events = await ctx.db
    .select()
    .from(schema.events)
    .where(eq(schema.events.orgId, aoId));

  const eventLocationIds = events
    .map((event) => event.locationId)
    .filter(isTruthy);

  const locationIds = !eventLocationIds.length
    ? []
    : await ctx.db
        .select({ id: schema.locations.id })
        .from(schema.locations)
        .where(inArray(schema.locations.id, eventLocationIds));

  return locationIds.map((l) => l.id);
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
