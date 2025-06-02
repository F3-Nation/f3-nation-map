import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { InferInsertModel } from "@acme/db";
import { and, count, eq, inArray, isNull, or, schema } from "@acme/db";
import { IsActiveStatus } from "@acme/shared/app/enums";
import { EventTypeInsertSchema, SortingSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getSortingColumns } from "../get-sorting-columns";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";
import { withPagination } from "../with-pagination";

export const eventTypeRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        orgIds: z.number().array().optional(),
        statuses: z.enum(IsActiveStatus).array().optional(),
        pageIndex: z.number().optional(),
        pageSize: z.number().optional(),
        searchTerm: z.string().optional(),
        sorting: SortingSchema.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pageSize = input?.pageSize ?? 10;
      const pageIndex = (input?.pageIndex ?? 0) * pageSize;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;

      const select = {
        id: schema.eventTypes.id,
        name: schema.eventTypes.name,
        description: schema.eventTypes.description,
        eventCategory: schema.eventTypes.eventCategory,
        specificOrgId: schema.eventTypes.specificOrgId,
        specificOrgName: schema.orgs.name,
        count: count(schema.eventsXEventTypes.eventTypeId),
      };

      const where = and(
        input?.orgIds?.length
          ? or(
              inArray(schema.eventTypes.specificOrgId, input?.orgIds),
              isNull(schema.eventTypes.specificOrgId),
            )
          : undefined,
        !input?.statuses?.length ||
          input.statuses.length === IsActiveStatus.length
          ? undefined
          : input.statuses.includes("active")
            ? eq(schema.eventTypes.isActive, true)
            : eq(schema.eventTypes.isActive, false),
      );

      const sortedColumns = getSortingColumns(
        input?.sorting,
        {
          id: schema.eventTypes.id,
          name: schema.eventTypes.name,
          description: schema.eventTypes.description,
          eventCategory: schema.eventTypes.eventCategory,
          specificOrgId: schema.eventTypes.specificOrgId,
          specificOrgName: schema.orgs.name,
          count: count(schema.eventsXEventTypes.eventTypeId),
          created: schema.eventTypes.created,
        },
        "id",
      );

      const [eventTypeCount] = await ctx.db
        .select({ count: count(schema.eventTypes.id) })
        .from(schema.eventTypes)
        .where(where);

      if (!eventTypeCount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event type not found",
        });
      }
      const countAmount = eventTypeCount?.count;

      const query = ctx.db
        .select(select)
        .from(schema.eventTypes)
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .leftJoin(
          schema.orgs,
          eq(schema.eventTypes.specificOrgId, schema.orgs.id),
        )
        .where(where)
        .groupBy(schema.eventTypes.id, schema.orgs.name);

      const eventTypes = usePagination
        ? await withPagination(
            query.$dynamic(),
            sortedColumns,
            pageIndex,
            pageSize,
          )
        : await query;

      return { eventTypes, count: countAmount };
    }),
  byOrgId: publicProcedure
    .input(z.object({ orgId: z.number(), isActive: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      const eventTypes = await ctx.db
        .select()
        .from(schema.eventTypes)
        .where(
          and(
            eq(schema.eventTypes.specificOrgId, input.orgId),
            input.isActive
              ? eq(schema.eventTypes.isActive, input.isActive)
              : eq(schema.eventTypes.isActive, true),
          ),
        );

      return eventTypes;
    }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select()
        .from(schema.eventTypes)
        .where(eq(schema.eventTypes.id, input.id));

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event type not found",
        });
      }

      return result;
    }),
  crupdate: editorProcedure
    .input(EventTypeInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const [existingEventType] = input.id
        ? await ctx.db
            .select()
            .from(schema.eventTypes)
            .where(eq(schema.eventTypes.id, input.id))
        : [];

      const [nationOrg] = await ctx.db
        .select({ id: schema.orgs.id })
        .from(schema.orgs)
        .where(eq(schema.orgs.orgType, "nation"));

      if (!nationOrg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nation organization not found",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId:
          existingEventType?.specificOrgId ??
          input.specificOrgId ??
          nationOrg.id, // check nation if no specific org
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });

      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this Event Type",
        });
      }
      const eventTypeData: InferInsertModel<typeof schema.eventTypes> = {
        ...input,
        // eventCategory: (input.eventCategory ?? "first_f") as EventCategory,
      };
      await ctx.db
        .insert(schema.eventTypes)
        .values(eventTypeData)
        .onConflictDoUpdate({
          target: schema.eventTypes.id,
          set: eventTypeData,
        });
    }),
  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [nationOrg] = await ctx.db
        .select({ id: schema.orgs.id })
        .from(schema.orgs)
        .where(eq(schema.orgs.orgType, "nation"));

      if (!nationOrg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nation organization not found",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: nationOrg.id,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this Event Type",
        });
      }

      await ctx.db
        .update(schema.eventTypes)
        .set({ isActive: false })
        .where(eq(schema.eventTypes.id, input.id));
    }),
});
