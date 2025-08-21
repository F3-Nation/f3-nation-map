import { TRPCError } from "@trpc/server";
import omit from "lodash/omit";
import { z } from "zod";

import type { OrgType } from "@acme/shared/app/enums";
import type { EventMeta } from "@acme/shared/app/types";
import {
  aliasedTable,
  and,
  countDistinct,
  eq,
  ilike,
  inArray,
  or,
  schema,
} from "@acme/db";
import { UpdateRequestStatus } from "@acme/shared/app/enums";
import {
  DeleteRequestSchema,
  RequestInsertSchema,
  SortingSchema,
} from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getEditableOrgIdsForUser } from "../get-editable-org-ids";
import { getSortingColumns } from "../get-sorting-columns";
import { applyDeleteRequest } from "../lib/apply-delete-request";
import { applyUpdateRequest } from "../lib/apply-update-request";
import { checkUpdatePermissions } from "../lib/check-update-permissions";
import { recordUpdateRequest } from "../lib/update-request-handlers";
import { notifyMapChangeRequest } from "../services/map-request-notification";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";
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
          onlyMine: z.boolean().optional(),
          statuses: z.enum(UpdateRequestStatus).array().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const onlyMine = input?.onlyMine ?? false;
      const oldAoOrg = aliasedTable(schema.orgs, "old_ao_org");
      const oldRegionOrg = aliasedTable(schema.orgs, "old_region_org");
      const oldLocation = aliasedTable(schema.locations, "old_location");
      const newRegionOrg = aliasedTable(schema.orgs, "new_region_org");

      const limit = input?.pageSize ?? 10;
      const offset = (input?.pageIndex ?? 0) * limit;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;

      // Determine if filter by region IDs is needed
      let editableOrgs: { id: number; type: OrgType }[] = [];
      let isNationAdmin = false;

      if (onlyMine) {
        const result = await getEditableOrgIdsForUser(ctx);
        editableOrgs = result.editableOrgs;
        isNationAdmin = result.isNationAdmin;

        if (editableOrgs.length === 0 && !isNationAdmin) {
          // User has no editable orgs and is not a nation admin
          return { requests: [], totalCount: 0 };
        }
      }

      const where = and(
        input?.statuses?.length
          ? inArray(schema.updateRequests.status, input?.statuses)
          : undefined,
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
        // Filter by editable orgs if onlyMine is true and not a nation admin
        onlyMine && !isNationAdmin && editableOrgs.length > 0
          ? inArray(
              schema.updateRequests.regionId,
              editableOrgs.map((org) => org.id),
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
  canDeleteEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .select()
        .from(schema.updateRequests)
        .where(
          and(
            eq(schema.updateRequests.eventId, input.eventId),
            eq(schema.updateRequests.requestType, "delete_event"),
            eq(schema.updateRequests.status, "pending"),
          ),
        );
      return !!request;
    }),
  canEditRegions: publicProcedure
    .input(z.object({ orgIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session) {
        return input.orgIds.map((orgId) => ({
          success: false,
          mode: "public",
          orgId,
          roleName: "editor",
        }));
      }

      const results = await Promise.all(
        input.orgIds.map((orgId) =>
          checkHasRoleOnOrg({
            orgId,
            session,
            db: ctx.db,
            roleName: "editor",
          }),
        ),
      );
      return results;
    }),
  submitDeleteRequest: publicProcedure
    .input(DeleteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }

      const [existingEvent] = input.eventId
        ? await ctx.db
            .select()
            .from(schema.events)
            .where(eq(schema.events.id, input.eventId))
        : [];

      const [existingAO] = input.originalAoId
        ? await ctx.db
            .select()
            .from(schema.orgs)
            .where(
              and(
                eq(schema.orgs.id, input.originalAoId),
                eq(schema.orgs.orgType, "ao"),
              ),
            )
        : [];

      const canEditRegion = ctx.session
        ? await checkHasRoleOnOrg({
            orgId: input.originalRegionId,
            session: ctx.session,
            db: ctx.db,
            roleName: "editor",
          })
        : { success: false };

      const canEditAO = !existingAO
        ? { success: true }
        : ctx.session && existingAO?.parentId
          ? await checkHasRoleOnOrg({
              orgId: existingAO.parentId,
              session: ctx.session,
              db: ctx.db,
              roleName: "editor",
            })
          : { success: false };

      const canEditEvent = !existingEvent
        ? { success: true }
        : ctx.session && existingEvent?.orgId
          ? await checkHasRoleOnOrg({
              orgId: existingEvent.orgId,
              session: ctx.session,
              db: ctx.db,
              roleName: "editor",
            })
          : { success: false };

      // Immediately update if user has permission
      if (
        canEditRegion.success &&
        canEditAO.success &&
        canEditEvent.success &&
        ctx.session?.user?.email
      ) {
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
          regionId: input.originalRegionId,
          requestType: "delete_event",
          eventName: input.eventName,
          submittedBy: input.submittedBy,
        })
        .returning();

      if (!request) {
        throw new Error("Unable to create a new request");
      }

      // Notify admins and editors about the new delete request
      if (request.status === "pending") {
        try {
          await notifyMapChangeRequest({
            db: ctx.db,
            requestId: request.id,
          });
        } catch (error) {
          console.error("Failed to send notification", { error });
          // Don't fail the request if notification fails
        }
      }

      return {
        status: "pending",
        deleteRequest: request,
      };
    }),
  submitUpdateRequest: publicProcedure
    .input(RequestInsertSchema)
    .mutation(async ({ ctx, input: _input }) => {
      const regionId = _input.regionId ?? _input.originalRegionId;
      if (!regionId) {
        throw new Error("Region id is required");
      }

      const input = { ..._input, regionId };

      console.log("submitUpdateRequest", input);
      const submittedBy = ctx.session?.user?.email ?? input.submittedBy;
      if (!submittedBy) {
        throw new Error("Submitted by is required");
      }

      const permissions = await checkUpdatePermissions({
        input,
        ctx,
      });

      // Immediately update if user has permission
      if (permissions.success && ctx.session?.user?.email) {
        const result = await applyUpdateRequest(ctx, {
          ...input,
          reviewedBy: ctx.session?.user?.email,
        });
        return result;
      }

      // const input = processSpecificSchema(_input);
      const updateRequest: typeof schema.updateRequests.$inferInsert = {
        ...input,
        submittedBy,
        submitterValidated: false,
        reviewedBy: null,
        reviewedAt: null,
        eventMeta: input.eventMeta as EventMeta,
      };

      const inserted = await recordUpdateRequest(ctx, updateRequest);

      // Notify admins and editors about the new request
      if (inserted.status === "pending") {
        try {
          await notifyMapChangeRequest({
            db: ctx.db,
            requestId: inserted.id,
          });
        } catch (error) {
          console.error("Failed to send notification", { error });
          // Don't fail the request if notification fails
        }
      }

      return {
        status: "pending" as const,
        updateRequest: omit(inserted, ["token"]),
      };
    }),
  validateDeleteByAdmin: editorProcedure
    .input(DeleteRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const reviewedBy = ctx.session?.user?.email;
      if (!reviewedBy) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Validated by is required",
        });
      }
      const result = await applyDeleteRequest(ctx, {
        ...input,
        reviewedBy,
      });
      return result;
    }),
  validateSubmissionByAdmin: editorProcedure
    .input(RequestInsertSchema)
    .mutation(async ({ ctx, input: _input }) => {
      const regionId = _input.regionId ?? _input.originalRegionId;
      if (!regionId) {
        throw new Error("Region id is required");
      }

      const input = { ..._input, regionId };
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

      if (
        input.requestType === "delete_event" ||
        input.requestType === "delete_ao"
      ) {
        const originalRegionId = input.originalRegionId;
        if (!originalRegionId) {
          throw new Error("Original region id is required to delete an event");
        }
        const result = await applyDeleteRequest(ctx, {
          ...input,
          requestType: input.requestType,
          originalRegionId,
          reviewedBy,
        });
        return {
          status: result.status,
          deleteRequest: result.deleteRequest,
        };
      } else {
        const result = await applyUpdateRequest(ctx, {
          ...input,
          regionId: input.regionId,
          reviewedBy,
        });
        return {
          status: result.status,
          updateRequest: result.updateRequest,
        };
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
