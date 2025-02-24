import { TRPCError } from "@trpc/server";
import omit from "lodash/omit";
import { z } from "zod";

import type { DayOfWeek } from "@f3/shared/app/enums";
import type { EventMeta, UpdateRequestMeta } from "@f3/shared/app/types";
import { aliasedTable, desc, eq, schema } from "@f3/db";
import { RequestInsertSchema } from "@f3/validators";

import type { Context } from "../trpc";
import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import {
  createTRPCRouter,
  editorProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

export const requestRouter = createTRPCRouter({
  all: editorProcedure.query(async ({ ctx }) => {
    const oldAoOrg = aliasedTable(schema.orgs, "old_ao_org");
    const oldRegionOrg = aliasedTable(schema.orgs, "old_region_org");
    const oldLocation = aliasedTable(schema.locations, "old_location");
    const newRegionOrg = aliasedTable(schema.orgs, "new_region_org");

    const requests = await ctx.db
      .select({
        id: schema.updateRequests.id,
        submittedBy: schema.updateRequests.submittedBy,
        submitterValidated: schema.updateRequests.submitterValidated,
        oldWorkoutName: schema.events.name,
        newWorkoutName: schema.updateRequests.eventName,
        // regionName: newRegionOrg.name,
        // locationName: schema.updateRequests.locationName,
        oldRegionName: oldRegionOrg.name,
        newRegionName: newRegionOrg.name,
        oldLocationName: oldLocation.name,
        newLocationName: schema.updateRequests.locationName,
        oldDayOfWeek: schema.events.dayOfWeek,
        newDayOfWeek: schema.updateRequests.eventDayOfWeek,
        oldStartTime: schema.events.startTime,
        newStartTime: schema.updateRequests.eventStartTime,
        oldEndTime: schema.events.endTime,
        newEndTime: schema.updateRequests.eventEndTime,
        oldDescription: schema.events.description,
        newDescription: schema.updateRequests.eventDescription,
        oldLocationAddress: oldLocation.addressStreet,
        newLocationAddress: schema.updateRequests.locationAddress,
        oldLocationAddress2: oldLocation.addressStreet2,
        newLocationAddress2: schema.updateRequests.locationAddress2,
        oldLocationCity: oldLocation.addressCity,
        newLocationCity: schema.updateRequests.locationCity,
        oldLocationState: oldLocation.addressState,
        newLocationState: schema.updateRequests.locationState,
        oldLocationCountry: oldLocation.addressCountry,
        newLocationCountry: schema.updateRequests.locationCountry,
        oldLocationZipCode: oldLocation.addressZip,
        newLocationZipCode: schema.updateRequests.locationZip,
        oldLocationLat: oldLocation.latitude,
        newLocationLat: schema.updateRequests.locationLat,
        oldLocationLng: oldLocation.longitude,
        newLocationLng: schema.updateRequests.locationLng,
        created: schema.updateRequests.created,
        status: schema.updateRequests.status,
      })
      .from(schema.updateRequests)
      .leftJoin(
        newRegionOrg,
        eq(schema.updateRequests.regionId, newRegionOrg.id),
      )
      .leftJoin(
        schema.events,
        eq(schema.updateRequests.eventId, schema.events.id),
      )
      .leftJoin(oldAoOrg, eq(oldAoOrg.id, schema.events.orgId))
      .leftJoin(oldRegionOrg, eq(oldRegionOrg.id, oldAoOrg.parentId))
      .leftJoin(oldLocation, eq(oldLocation.id, schema.events.locationId))
      .orderBy(desc(schema.updateRequests.created));
    return requests.map((request) => ({
      ...request,
    }));
  }),
  byId: editorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(eq(schema.updateRequests.id, input.id));
      return request;
    }),

  submitUpdateRequest: publicProcedure
    .input(RequestInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }

      const updateRequest: typeof schema.updateRequests.$inferInsert = {
        ...input,
        submittedBy,
        submitterValidated: false,
        reviewedBy: null,
        reviewedAt: null,
      };

      const [inserted] = await ctx.db
        .insert(schema.updateRequests)
        .values(updateRequest)
        .returning();

      if (!inserted) {
        throw new Error("Failed to insert update request");
      }
      const [region] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.regionId));

      if (!region) {
        throw new Error("Failed to find region");
      }

      // Not sending emails for now
      // const eventNames = await ctx.db
      //   .select({ name: schema.eventTypes.name })
      //   .from(schema.eventTypes)
      //   .where(inArray(schema.eventTypes.id, input.eventTypeIds ?? []));

      // await mail.sendTemplateMessages(Templates.validateSubmission, {
      //   to: input.submittedBy,
      //   submissionId: inserted.id,
      //   token: inserted.token,
      //   regionName: region?.name,
      //   eventName: inserted.eventName,
      //   address: inserted.locationDescription ?? "",
      //   startTime: inserted.eventStartTime ?? "",
      //   endTime: inserted.eventEndTime ?? "",
      //   dayOfWeek: inserted.eventDayOfWeek ?? "",
      //   types: eventNames?.map((type) => type.name).join(", ") ?? "",
      //   url: env.NEXT_PUBLIC_URL,
      // });

      return { success: true, inserted: omit(inserted, ["token"]) };
    }),
  // This can be public because it uses a db token for auth
  validateSubmission: protectedProcedure
    .input(z.object({ token: z.string(), submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [updateRequest] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(eq(schema.updateRequests.id, input.submissionId));

      if (!updateRequest) {
        throw new Error("Failed to find update request");
      }

      if (updateRequest.token !== input.token) {
        throw new Error("Invalid token");
      }

      if (updateRequest.regionId == undefined) {
        throw new Error("Region ID is required");
      }

      const { success } = await checkHasRoleOnOrg({
        orgId: updateRequest.regionId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });

      if (!success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You do not have permission to edit this region. Please contact the administrator.`,
        });
      }

      const result = await applyUpdateRequest(ctx, {
        ...updateRequest,
        regionId: updateRequest.regionId,
        reviewedBy: "email",
        meta: updateRequest.meta,
        eventMeta: updateRequest.eventMeta,
      });

      return result;
    }),
  validateSubmissionByAdmin: editorProcedure
    .input(RequestInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const reviewedBy = ctx.session.user.email;
      if (!reviewedBy) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Validated by is required",
        });
      }

      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: input.regionId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      console.log("roleCheckResult", roleCheckResult);

      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this region",
        });
      }

      const result = await applyUpdateRequest(ctx, {
        ...input,
        reviewedBy,
      });

      return result;
    }),
  rejectSubmission: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [updateRequest] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(eq(schema.updateRequests.id, input.id));

      if (!updateRequest) {
        throw new Error("Failed to find update request");
      }

      const { success: hasPermissionToEditThisRegion } =
        await checkHasRoleOnOrg({
          orgId: updateRequest.regionId,
          session: ctx.session,
          db: ctx.db,
          roleName: "editor",
        });

      if (!hasPermissionToEditThisRegion) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this region",
        });
      }
      await ctx.db
        .update(schema.updateRequests)
        .set({ status: "rejected" })
        .where(eq(schema.updateRequests.id, input.id));
    }),
});

export const applyUpdateRequest = async (
  ctx: Context,
  updateRequest: Omit<
    z.infer<typeof RequestInsertSchema>,
    "meta" | "eventMeta" | "eventDayOfWeek"
  > & {
    reviewedBy: string;
    meta?: UpdateRequestMeta | null;
    eventMeta?: EventMeta | null;
    eventDayOfWeek?: DayOfWeek | null;
  },
) => {
  // LOCATION
  if (updateRequest.locationId == undefined) {
    console.log("Getting existing ao");

    // INSERT AO
    console.log("inserting ao", updateRequest);
    const [ao] = await ctx.db
      .insert(schema.orgs)
      .values({
        parentId: updateRequest.regionId,
        orgType: "ao",
        defaultLocationId: updateRequest.locationId,
        name: updateRequest.eventName ?? "",
        isActive: true,
        logoUrl: updateRequest.aoLogo,
      })
      .returning();

    if (!ao) throw new Error("Failed to insert AO");

    // INSERT LOCATION
    console.log("inserting location", updateRequest);
    const newLocation: typeof schema.locations.$inferInsert = {
      name: updateRequest.locationName ?? "",
      description: updateRequest.locationDescription ?? "",
      addressStreet: updateRequest.locationAddress ?? "",
      addressStreet2: updateRequest.locationAddress2 ?? "",
      addressCity: updateRequest.locationCity ?? "",
      addressState: updateRequest.locationState ?? "",
      addressZip: updateRequest.locationZip ?? "",
      addressCountry: updateRequest.locationCountry ?? "",
      latitude: updateRequest.locationLat,
      longitude: updateRequest.locationLng,
      orgId: ao.id,
      email: updateRequest.locationContactEmail,
      isActive: true,
    };
    const [location] = await ctx.db
      .insert(schema.locations)
      .values(newLocation)
      .returning();

    if (!location) {
      throw new Error("Failed to find location");
    }
    updateRequest.locationId = location.id;
  } else {
    console.log("updating location", updateRequest);
    await ctx.db
      .update(schema.locations)
      .set({
        name: updateRequest.locationName ?? "",
        description: updateRequest.locationDescription,
        addressStreet: updateRequest.locationAddress,
        addressStreet2: updateRequest.locationAddress2,
        addressCity: updateRequest.locationCity,
        addressState: updateRequest.locationState,
        addressZip: updateRequest.locationZip,
        addressCountry: updateRequest.locationCountry,
        latitude: updateRequest.locationLat,
        longitude: updateRequest.locationLng,
        email: updateRequest.locationContactEmail,
      })
      .where(eq(schema.locations.id, updateRequest.locationId));
  }

  const updateRequestInsertData: typeof schema.updateRequests.$inferInsert = {
    ...updateRequest,
    status: "approved",
    reviewedAt: new Date().toISOString(),
  };

  console.log("inserting update request", updateRequestInsertData);
  const [updated] = await ctx.db
    .insert(schema.updateRequests)
    .values(updateRequestInsertData)
    .onConflictDoUpdate({
      target: [schema.updateRequests.id],
      set: updateRequestInsertData,
    })
    .returning();

  if (!updated) {
    throw new Error("Failed to update update request");
  }

  // EVENT
  if (updateRequest.eventId != undefined) {
    console.log("updating event", updateRequest);
    await ctx.db
      .update(schema.events)
      .set({
        name: updateRequest.eventName,
        locationId: updateRequest.locationId,
        description: updateRequest.eventDescription,
        // Use undefined to not remove the existing value
        startDate: updateRequest.eventStartDate ?? undefined,
        endDate: updateRequest.eventEndDate ?? undefined,
        startTime: updateRequest.eventStartTime ?? undefined,
        endTime: updateRequest.eventEndTime ?? undefined,
        dayOfWeek: updateRequest.eventDayOfWeek ?? undefined,
        seriesId: updateRequest.eventSeriesId,
        isSeries: updateRequest.eventIsSeries ?? true,
        isActive: true,
        highlight: false,
        orgId: updateRequest.regionId,
        recurrencePattern: updateRequest.eventRecurrencePattern,
        recurrenceInterval: updateRequest.eventRecurrenceInterval,
        indexWithinInterval: updateRequest.eventIndexWithinInterval,
        meta: updateRequest.eventMeta,
        email: updateRequest.eventContactEmail,
      })
      .where(eq(schema.events.id, updateRequest.eventId));
  } else {
    console.log("inserting event", updateRequest);
    const newEvent: typeof schema.events.$inferInsert = {
      name: updateRequest.eventName,
      locationId: updateRequest.locationId,
      description: updateRequest.eventDescription,
      startDate: updateRequest.eventStartDate ?? undefined,
      endDate: updateRequest.eventEndDate ?? undefined,
      startTime: updateRequest.eventStartTime ?? undefined,
      endTime: updateRequest.eventEndTime ?? undefined,
      seriesId: updateRequest.eventSeriesId,
      isSeries: updateRequest.eventIsSeries ?? true,
      isActive: true,
      highlight: false,
      dayOfWeek: updateRequest.eventDayOfWeek,
      orgId: updateRequest.regionId,
      recurrencePattern: updateRequest.eventRecurrencePattern,
      recurrenceInterval: updateRequest.eventRecurrenceInterval,
      indexWithinInterval: updateRequest.eventIndexWithinInterval,
      meta: updateRequest.eventMeta,
      email: updateRequest.eventContactEmail,
    };

    const [_inserted] = await ctx.db
      .insert(schema.events)
      .values(newEvent)
      .returning();

    console.log("inserting event type", newEvent);
    if (!_inserted) {
      throw new Error("Failed to insert event");
    }

    console.log("updating event types", updateRequest.eventTypeIds);
    await ctx.db
      .delete(schema.eventsXEventTypes)
      .where(eq(schema.eventsXEventTypes.eventId, _inserted.id));
    await ctx.db.insert(schema.eventsXEventTypes).values(
      updateRequest.eventTypeIds?.map((id) => ({
        eventId: _inserted.id,
        eventTypeId: id,
      })) ?? [],
    );
  }

  return { success: true, updateRequest: omit(updated, ["token"]) };
};
