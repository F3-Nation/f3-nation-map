import type { Session } from "@acme/auth";
import type { AppDb } from "@acme/db/client";
import { eq, schema } from "@acme/db";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";

export const checkUpdatePermissions = async (params: {
  input: {
    eventId?: number | null;
    locationId?: number | null;
    regionId: number;
  };
  ctx: {
    db: AppDb;
    session: Session | null;
  };
}) => {
  const { input, ctx } = params;
  const [existingEvent] = input.eventId
    ? await ctx.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.id, input.eventId))
    : [null];

  const canEditEvent =
    existingEvent === null
      ? { success: true }
      : ctx.session && existingEvent?.orgId
        ? await checkHasRoleOnOrg({
            orgId: existingEvent.orgId,
            session: ctx.session,
            db: ctx.db,
            roleName: "editor",
          })
        : { success: false };

  const [existingLocation] = input.locationId
    ? await ctx.db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.id, input.locationId))
    : [null];

  const canEditLocation =
    existingLocation === null
      ? { success: true }
      : ctx.session && existingLocation?.orgId
        ? await checkHasRoleOnOrg({
            orgId: existingLocation.orgId,
            session: ctx.session,
            db: ctx.db,
            roleName: "editor",
          })
        : { success: false };

  const canEditRegion = ctx.session
    ? await checkHasRoleOnOrg({
        orgId: input.regionId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      })
    : { success: false };

  return {
    canEditEvent,
    canEditLocation,
    canEditRegion,
  };
};
