import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import omit from "lodash/omit";
import { z } from "zod";

import type { DayOfWeek } from "@acme/shared/app/enums";
import type { EventMeta, UpdateRequestMeta } from "@acme/shared/app/types";
import {
  aliasedTable,
  and,
  countDistinct,
  eq,
  ilike,
  or,
  schema,
} from "@acme/db";
import {
  DeleteRequestSchema,
  RequestInsertSchema,
  SortingSchema,
} from "@acme/validators";

import type { Context } from "../trpc";
import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getSortingColumns } from "../get-sorting-columns";
import {
  createTRPCRouter,
  editorProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { withPagination } from "../with-pagination";

export const requestRouter = createTRPCRouter({
  all: editorProcedure
    .input(
      z
        .object({
          pageIndex: z.number().optional(),
          pageSize: z.number().optional(),
          sorting: SortingSchema.optional(),
          searchTerm: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const oldAoOrg = aliasedTable(schema.orgs, "old_ao_org");
      const oldRegionOrg = aliasedTable(schema.orgs, "old_region_org");
      const oldLocation = aliasedTable(schema.locations, "old_location");
      const newRegionOrg = aliasedTable(schema.orgs, "new_region_org");

      const limit = input?.pageSize ?? 10;
      const offset = (input?.pageIndex ?? 0) * limit;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;

      const where = and(
        input?.searchTerm
          ? or(
              ilike(
                schema.updateRequests.submittedBy,
                `%${input?.searchTerm}%`,
              ),
              ilike(schema.updateRequests.eventName, `%${input?.searchTerm}%`),
              ilike(
                schema.updateRequests.eventDescription,
                `%${input?.searchTerm}%`,
              ),
              ilike(schema.updateRequests.aoName, `%${input?.searchTerm}%`),
              ilike(
                schema.updateRequests.locationName,
                `%${input?.searchTerm}%`,
              ),
              ilike(
                schema.updateRequests.locationDescription,
                `%${input?.searchTerm}%`,
              ),
            )
          : undefined,
      );

      const sortedColumns = getSortingColumns(
        input?.sorting,
        {
          id: schema.updateRequests.id,
          status: schema.updateRequests.status,
          requestType: schema.updateRequests.requestType,
          regionName: newRegionOrg.name,
          aoName: schema.updateRequests.aoName,
          workoutName: schema.updateRequests.eventName,
          dayOfWeek: schema.updateRequests.eventDayOfWeek,
          startTime: schema.updateRequests.eventStartTime,
          endTime: schema.updateRequests.eventEndTime,
          description: schema.updateRequests.eventDescription,
          locationAddress: schema.updateRequests.locationAddress,
          locationAddress2: schema.updateRequests.locationAddress2,
          locationCity: schema.updateRequests.locationCity,
          locationState: schema.updateRequests.locationState,
          locationZip: schema.updateRequests.locationZip,
          locationCountry: schema.updateRequests.locationCountry,
          latitude: schema.updateRequests.locationLat,
          longitude: schema.updateRequests.locationLng,
          submittedBy: schema.updateRequests.submittedBy,
          created: schema.updateRequests.created,
        },
        "id",
      );

      const select = {
        id: schema.updateRequests.id,
        submittedBy: schema.updateRequests.submittedBy,
        submitterValidated: schema.updateRequests.submitterValidated,
        oldWorkoutName: schema.events.name,
        newWorkoutName: schema.updateRequests.eventName,
        oldRegionName: oldRegionOrg.name,
        newRegionName: newRegionOrg.name,
        oldAoName: oldAoOrg.name,
        newAoName: schema.updateRequests.aoName,
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
        requestType: schema.updateRequests.requestType,
      };

      const [totalCount] = await ctx.db
        .select({ count: countDistinct(schema.updateRequests.id) })
        .from(schema.updateRequests)
        .where(where);

      const query = ctx.db
        .select(select)
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
        .where(where);

      const requests = usePagination
        ? await withPagination(query.$dynamic(), sortedColumns, offset, limit)
        : await query;

      return { requests, totalCount: totalCount?.count ?? 0 };
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
  canEditRegion: publicProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session) {
        return {
          success: false,
          mode: "public",
          orgId: input.orgId,
          roleName: "editor",
        };
      }
      const result = await checkHasRoleOnOrg({
        orgId: input.orgId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      return result;
    }),
  submitDeleteRequest: publicProcedure
    .input(DeleteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }

      const canEditRegion = ctx.session
        ? await checkHasRoleOnOrg({
            orgId: input.regionId,
            session: ctx.session,
            db: ctx.db,
            roleName: "editor",
          })
        : null;

      // Immediately update if user has permission
      if (canEditRegion?.success && ctx.session?.user?.email) {
        const result = await applyDeleteRequest(ctx, {
          ...input,
          reviewedBy: ctx.session?.user?.email,
        });
        return result;
      }

      const [request] = await ctx.db
        .insert(schema.updateRequests)
        .values({
          eventId: input.eventId,
          regionId: input.regionId,
          requestType: "delete_event",
          eventName: input.eventName,
          submittedBy: input.submittedBy,
        })
        .returning();

      if (!request) {
        throw new Error("Unable to create a new request");
      }

      return {
        status: "pending",
        updateRequest: request,
      };
    }),
  submitUpdateRequest: publicProcedure
    .input(RequestInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }

      const canEditRegion = ctx.session
        ? await checkHasRoleOnOrg({
            orgId: input.regionId,
            session: ctx.session,
            db: ctx.db,
            roleName: "editor",
          })
        : null;

      // Immediately update if user has permission
      if (canEditRegion?.success && ctx.session?.user?.email) {
        const result = await applyUpdateRequest(ctx, {
          ...input,
          reviewedBy: ctx.session?.user?.email,
        });
        return result;
      }

      const updateRequest: typeof schema.updateRequests.$inferInsert = {
        ...input,
        submittedBy,
        submitterValidated: false,
        reviewedBy: null,
        reviewedAt: null,
        eventMeta: input.eventMeta as EventMeta,
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

      return {
        status: "pending" as const,
        updateRequest: omit(inserted, ["token"]),
      };
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
      if (updateRequest.requestType === "delete_event") {
        const result = await applyDeleteRequest(ctx, {
          ...updateRequest,
          regionId: updateRequest.regionId,
          reviewedBy: "email",
          // Type check
          eventDayOfWeek: updateRequest.eventDayOfWeek ?? undefined,
          eventMeta: updateRequest.eventMeta ?? undefined,
        });
        return result;
      } else {
        const result = await applyUpdateRequest(ctx, {
          ...updateRequest,
          regionId: updateRequest.regionId,
          reviewedBy: "email",
        });
        return result;
      }
    }),

  validateDeleteByAdmin: editorProcedure
    .input(DeleteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await applyDeleteRequest(ctx, {
        ...input,
        reviewedBy: ctx.session?.user?.email,
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

      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this region",
        });
      }

      if (input.requestType === "delete_event") {
        const result = await applyDeleteRequest(ctx, {
          ...input,
          regionId: input.regionId,
          reviewedBy: "email",
          // Type check
          eventDayOfWeek: input.eventDayOfWeek ?? undefined,
          eventMeta: input.eventMeta ?? undefined,
        });
        return result;
      } else {
        const result = await applyUpdateRequest(ctx, {
          ...input,
          regionId: input.regionId,
          reviewedBy: "email",
        });
        return result;
      }
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

export const applyDeleteRequest = async (
  ctx: Context,
  updateRequest: Partial<z.infer<typeof RequestInsertSchema>>,
) => {
  if (updateRequest.eventId != undefined) {
    await ctx.db
      .update(schema.updateRequests)
      .set({ eventId: null })
      .where(eq(schema.updateRequests.eventId, updateRequest.eventId));
    await ctx.db
      .delete(schema.eventsXEventTypes)
      .where(eq(schema.eventsXEventTypes.eventId, updateRequest.eventId));
    await ctx.db
      .delete(schema.events)
      .where(eq(schema.events.id, updateRequest.eventId));
  } else if (updateRequest.locationId != undefined) {
    await ctx.db
      .delete(schema.locations)
      .where(eq(schema.locations.id, updateRequest.locationId));
  } else {
    throw new Error("Nothing to delete");
  }

  revalidatePath("/");
  return {
    status: "approved" as const,
    updateRequest: omit(updateRequest, ["token"]),
  };
};

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
): Promise<{
  status: "approved" | "rejected" | "pending";
  updateRequest: Omit<typeof schema.updateRequests.$inferSelect, "token">;
}> => {
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
        name: updateRequest.aoName ?? "",
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
    const [location] = await ctx.db
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
      .where(eq(schema.locations.id, updateRequest.locationId))
      .returning();

    if (!location) {
      throw new Error("Failed to find location to update");
    }

    const [ao] = await ctx.db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.id, location.orgId));

    if (ao?.orgType !== "ao") {
      throw new Error(
        "Failed to find ao to update. Is the location associated to an AO?",
      );
    }

    // UPDATE AO
    await ctx.db
      .update(schema.orgs)
      .set({
        name: updateRequest.aoName ?? ao.name,
        logoUrl: updateRequest.aoLogo,
        parentId: updateRequest.regionId,
      })
      .where(eq(schema.orgs.id, location.orgId));
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
      startDate: updateRequest.eventStartDate ?? dayjs().format("YYYY-MM-DD"),
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

  revalidatePath("/");
  return {
    status: "approved",
    updateRequest: omit(updated, ["token"]),
  };
};
