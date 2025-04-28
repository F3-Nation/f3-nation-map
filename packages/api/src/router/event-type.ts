import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { InferInsertModel } from "@acme/db";
import { count, eq, inArray, schema } from "@acme/db";
import { EventTypeInsertSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";

export const eventTypeRouter = createTRPCRouter({
  all: publicProcedure
    .input(z.object({ orgIds: z.number().array().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          id: schema.eventTypes.id,
          name: schema.eventTypes.name,
          description: schema.eventTypes.description,
          eventCategory: schema.eventTypes.eventCategory,
          specificOrgId: schema.eventTypes.specificOrgId,
          specificOrgName: schema.orgs.name,
          count: count(schema.eventsXEventTypes.eventTypeId),
        })
        .from(schema.eventTypes)
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .leftJoin(
          schema.orgs,
          eq(schema.eventTypes.specificOrgId, schema.orgs.id),
        )
        .where(
          input?.orgIds?.length
            ? inArray(schema.eventTypes.specificOrgId, input?.orgIds)
            : undefined,
        )
        .groupBy(schema.eventTypes.id, schema.orgs.name);

      return { eventTypes: result, total: result.length };
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
        .delete(schema.eventTypes)
        .where(eq(schema.eventTypes.id, input.id));
    }),
});
