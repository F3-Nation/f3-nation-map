import { TRPCError } from "@trpc/server";
import omit from "lodash/omit";
import { z } from "zod";

import { desc, eq, schema } from "@f3/db";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { RequestInsertSchema } from "@f3/validators";

import type { Context } from "../trpc";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";

export const requestRouter = createTRPCRouter({
  all: editorProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db
      .select({
        id: schema.updateRequests.id,
        submittedBy: schema.updateRequests.submittedBy,
        submitterValidated: schema.updateRequests.submitterValidated,
        regionName: schema.orgs.name,
        oldWorkoutName: schema.events.name,
        newWorkoutName: schema.updateRequests.eventName,
        created: schema.updateRequests.created,
        status: schema.updateRequests.status,
      })
      .from(schema.updateRequests)
      .leftJoin(schema.orgs, eq(schema.updateRequests.regionId, schema.orgs.id))
      .leftJoin(
        schema.events,
        eq(schema.updateRequests.eventId, schema.events.id),
      )
      .orderBy(desc(schema.updateRequests.created));
    console.log("requests", requests);
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
  validateSubmission: publicProcedure
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

      const result = await applyUpdateRequest(ctx, {
        ...updateRequest,
        reviewedBy: "email",
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

      if (
        ctx.session.role !== "admin" &&
        !ctx.session.editingRegionIds.includes(input.regionId)
      ) {
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

      if (
        ctx.session.role !== "admin" &&
        !ctx.session.editingRegionIds.includes(updateRequest.regionId)
      ) {
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
  updateRequest: z.infer<typeof RequestInsertSchema> & { reviewedBy: string },
) => {
  // LOCATION
  if (
    updateRequest.locationId == undefined ||
    updateRequest.locationId === -1
  ) {
    const [aoOrg] = await ctx.db
      .select({ id: schema.orgTypes.id })
      .from(schema.orgTypes)
      .where(eq(schema.orgTypes.name, "AO"));

    if (!aoOrg) throw new Error("Failed to find AO org type");

    // INSERT AO
    const [ao] = await ctx.db
      .insert(schema.orgs)
      .values({
        parentId: updateRequest.regionId,
        orgTypeId: aoOrg.id,
        defaultLocationId: updateRequest.locationId,
        name: updateRequest.eventName ?? "",
        isActive: true,
        logoUrl: updateRequest.aoLogo,
      })
      .returning();

    if (!ao) throw new Error("Failed to insert AO");

    // INSERT LOCATION
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
    await ctx.db
      .update(schema.locations)
      .set({
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
    reviewedAt: new Date(),
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
    throw new Error("Failed to update update request");
  }

  // EVENT
  if (updateRequest.eventId != undefined) {
    await ctx.db
      .update(schema.events)
      .set({
        name: updateRequest.eventName,
        locationId: updateRequest.locationId,
        description: updateRequest.eventDescription,
        startDate: updateRequest.eventStartDate ?? undefined,
        endDate: updateRequest.eventEndDate ?? undefined,
        startTime: updateRequest.eventStartTime ?? undefined,
        endTime: updateRequest.eventEndTime ?? undefined,
        dayOfWeek: updateRequest.eventDayOfWeek
          ? DAY_ORDER.indexOf(updateRequest.eventDayOfWeek)
          : undefined,
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
      dayOfWeek: updateRequest.eventDayOfWeek
        ? DAY_ORDER.indexOf(updateRequest.eventDayOfWeek)
        : undefined,
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
  }

  return { success: true, updateRequest: omit(updated, ["token"]) };
};
