import type { Session } from "@acme/auth";
import type { AppDb } from "@acme/db/client";
import { eq, schema } from "@acme/db";
import { isTruthy, onlyUnique } from "@acme/shared/common/functions";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";

export const checkUpdatePermissions = async (params: {
  input: {
    eventId?: number | null;
    locationId?: number | null;
    regionId: number;
    originalRegionId: number | null;
  };
  ctx: {
    db: AppDb;
    session: Session | null;
  };
}) => {
  const { input, ctx } = params;
  const session = ctx.session;
  if (!session) {
    return {
      success: false,
      orgId: null,
      roleName: null,
      mode: "no-permission",
    };
  }

  const [existingEvent] = input.eventId
    ? await ctx.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.id, input.eventId))
    : [null];

  const locationIds = [input.locationId, existingEvent?.locationId].filter(
    isTruthy,
  );

  const locations =
    locationIds.length > 0
      ? await Promise.all(
          locationIds.map(async (locationId) => {
            const [existingLocation] = await ctx.db
              .select()
              .from(schema.locations)
              .where(eq(schema.locations.id, locationId));
            return existingLocation;
          }),
        )
      : [];

  const orgsToCheck = [
    existingEvent?.orgId,
    ...locations.map((l) => l?.orgId),
    input.originalRegionId,
    input.regionId,
  ]
    .filter(isTruthy)
    .filter(onlyUnique);

  const canEditRegions =
    orgsToCheck.length === 0
      ? [{ success: false, orgId: null, roleName: null, mode: "no-permission" }]
      : await Promise.all(
          orgsToCheck.map(async (orgId) => {
            return await checkHasRoleOnOrg({
              orgId,
              session,
              db: ctx.db,
              roleName: "editor",
            });
          }),
        );

  return {
    success: canEditRegions.every((c) => c.success),
    results: canEditRegions,
  };
};
