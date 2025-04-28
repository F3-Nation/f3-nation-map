import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  aliasedTable,
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  schema,
  sql,
} from "@acme/db";
import { IsActiveStatus } from "@acme/shared/app/enums";
import { EventInsertSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";
import { withPagination } from "../with-pagination";

export const eventRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z
        .object({
          pageIndex: z.number().optional(),
          pageSize: z.number().optional(),
          searchTerm: z.string().optional(),
          statuses: z.enum(["active", "inactive"]).array().optional(),
          sorting: z
            .array(z.object({ id: z.string(), desc: z.boolean() }))
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const parentOrg = aliasedTable(schema.orgs, "parent_org");
      const limit = input?.pageSize ?? 10;
      const offset = (input?.pageIndex ?? 0) * limit;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;
      const where = and(
        !input?.statuses?.length ||
          input.statuses.length === IsActiveStatus.length
          ? undefined
          : input.statuses.includes("active")
            ? eq(schema.events.isActive, true)
            : eq(schema.events.isActive, false),
        input?.searchTerm
          ? or(
              ilike(schema.events.name, `%${input?.searchTerm}%`),
              ilike(schema.events.description, `%${input?.searchTerm}%`),
            )
          : undefined,
      );
      const sortedColumns = input?.sorting?.map((sorting) => {
        const direction = sorting.desc ? desc : asc;
        switch (sorting.id) {
          case "regions":
            return direction(regionOrg.name);
          case "parent":
            return direction(parentOrg.name);
          case "status":
            return direction(schema.events.isActive);
          case "dayOfWeek":
            return direction(schema.events.dayOfWeek);
          case "created":
            return direction(schema.events.created);
          default:
            return direction(schema.events.id);
        }
      }) ?? [desc(schema.events.id)];

      const select = {
        id: schema.events.id,
        name: schema.events.name,
        description: schema.events.description,
        isActive: schema.events.isActive,
        parent: parentOrg.name,
        locationId: schema.events.locationId,
        startDate: schema.events.startDate,
        dayOfWeek: schema.events.dayOfWeek,
        startTime: schema.events.startTime,
        endTime: schema.events.endTime,
        email: schema.events.email,
        created: schema.events.created,
        parents: sql<{ aoId: number; aoName: string }[]>`COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'parentId', ${parentOrg.id}, 
            'parentName', ${parentOrg.name}
          )
        ) 
        FILTER (
          WHERE ${parentOrg.id} IS NOT NULL
        ), 
        '[]'
      )`,
        regions: sql<{ regionId: number; regionName: string }[]>`COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'regionId', ${regionOrg.id}, 
              'regionName', ${regionOrg.name}
            )
          ) 
          FILTER (
            WHERE ${regionOrg.id} IS NOT NULL
          ), 
          '[]'
        )`,
      };

      const [eventCount] = await ctx.db
        .select({ count: count() })
        .from(schema.events)
        .innerJoin(
          schema.locations,
          eq(schema.locations.id, schema.events.locationId),
        )
        .where(where);

      const query = ctx.db
        .select(select)
        .from(schema.events)
        .innerJoin(
          schema.locations,
          eq(schema.locations.id, schema.events.locationId),
        )
        .leftJoin(
          parentOrg,
          and(
            eq(parentOrg.orgType, "ao"),
            eq(parentOrg.id, schema.events.orgId),
          ),
        )
        .leftJoin(
          regionOrg,
          and(
            eq(regionOrg.orgType, "region"),
            or(
              eq(regionOrg.id, schema.locations.orgId),
              eq(regionOrg.id, schema.events.orgId),
              eq(regionOrg.id, parentOrg.parentId),
            ),
          ),
        )
        .groupBy(schema.events.id, parentOrg.id, regionOrg.id)
        .where(where);

      const events = usePagination
        ? await withPagination(query.$dynamic(), sortedColumns, offset, limit)
        : await query;

      return { events, total: eventCount?.count ?? 0 };
    }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const [event] = await ctx.db
        .select({
          id: schema.events.id,
          name: schema.events.name,
          description: schema.events.description,
          isActive: schema.events.isActive,
          location: aoOrg.name,
          locationId: schema.events.locationId,
          startDate: schema.events.startDate,
          dayOfWeek: schema.events.dayOfWeek,
          startTime: schema.events.startTime,
          endTime: schema.events.endTime,
          email: schema.events.email,
          highlight: schema.events.highlight,
          created: schema.events.created,
          meta: schema.events.meta,
          aos: sql<{ aoId: number; aoName: string }[]>`COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'aoId', ${aoOrg.id}, 
                'aoName', ${aoOrg.name}
              )
            ) 
            FILTER (
              WHERE ${aoOrg.id} IS NOT NULL
            ), 
            '[]'
          )`,
          regions: sql<{ regionId: number; regionName: string }[]>`COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'regionId', ${regionOrg.id}, 
                'regionName', ${regionOrg.name}
              )
            ) 
            FILTER (
              WHERE ${regionOrg.id} IS NOT NULL
            ), 
            '[]'
          )`,
          eventTypes: sql<
            { eventTypeId: number; eventTypeName: string }[]
          >`COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'eventTypeId', ${schema.eventTypes.id},
                'eventTypeName', ${schema.eventTypes.name}
              )
            )
            FILTER (
              WHERE ${schema.eventTypes.id} IS NOT NULL
            ),
            '[]'
          )`,
        })
        .from(schema.events)
        .leftJoin(
          schema.locations,
          eq(schema.locations.id, schema.events.locationId),
        )
        .leftJoin(
          aoOrg,
          and(eq(aoOrg.orgType, "ao"), eq(aoOrg.id, schema.events.orgId)),
        )
        .leftJoin(
          regionOrg,
          and(
            eq(regionOrg.orgType, "region"),
            or(
              eq(regionOrg.id, schema.locations.orgId),
              eq(regionOrg.id, schema.events.orgId),
              eq(regionOrg.id, aoOrg.parentId),
            ),
          ),
        )
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventsXEventTypes.eventId, schema.events.id),
        )
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .where(eq(schema.events.id, input.id))
        .groupBy(schema.events.id, aoOrg.id, regionOrg.id);

      return event;
    }),
  crupdate: editorProcedure
    .input(EventInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const orgIdToCheck = input.aoId ?? input.regionId;
      if (!orgIdToCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AO ID or Region ID is required",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: orgIdToCheck,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this Event",
        });
      }

      const { eventTypeId, meta, ...eventData } = input;
      const eventToUpdate: typeof schema.events.$inferInsert = {
        ...eventData,
        orgId: input.aoId,
        meta: meta
          ? {
              ...meta,
              mapSeed: meta.mapSeed as boolean | undefined,
              eventTypeId: undefined, // Remove eventTypeId from meta since we handle it in join table
            }
          : null,
      };

      const [result] = await ctx.db
        .insert(schema.events)
        .values(eventToUpdate)
        .onConflictDoUpdate({
          target: [schema.events.id],
          set: eventToUpdate,
        })
        .returning();

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create/update event",
        });
      }

      // Handle event type in join table
      if (eventTypeId) {
        await ctx.db
          .delete(schema.eventsXEventTypes)
          .where(eq(schema.eventsXEventTypes.eventId, result.id));

        await ctx.db.insert(schema.eventsXEventTypes).values({
          eventId: result.id,
          eventTypeId,
        });
      }

      return result;
    }),
  types: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(schema.eventTypes);
  }),
  eventIdToRegionNameLookup: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const parentOrg = aliasedTable(schema.orgs, "parent_org");
    const result = await ctx.db
      .select({
        eventId: schema.events.id,
        regionName: regionOrg.name,
      })
      .from(schema.events)
      .leftJoin(parentOrg, eq(schema.events.orgId, parentOrg.id))
      .leftJoin(
        regionOrg,
        or(
          and(
            eq(schema.events.orgId, regionOrg.id),
            eq(regionOrg.orgType, "region"),
          ),
          and(
            eq(parentOrg.orgType, "ao"),
            eq(parentOrg.parentId, regionOrg.id),
            eq(regionOrg.orgType, "region"),
          ),
        ),
      )
      .groupBy(schema.events.id, regionOrg.id);

    const lookup = result.reduce(
      (acc, curr) => {
        if (curr.regionName) {
          acc[curr.eventId] = curr.regionName;
        }
        return acc;
      },
      {} as Record<number, string>,
    );

    return lookup;
  }),
  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .select()
        .from(schema.events)
        .where(eq(schema.events.id, input.id));
      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: event.orgId,
        session: ctx.session,
        db: ctx.db,
        roleName: "admin",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this Event",
        });
      }
      await ctx.db
        .update(schema.events)
        .set({ isActive: false })
        .where(
          and(eq(schema.events.id, input.id), eq(schema.events.isActive, true)),
        );
    }),
});
