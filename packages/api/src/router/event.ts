import { z } from "zod";

import { aliasedTable, and, eq, or, schema, sql } from "@acme/db";
import { EventInsertSchema } from "@acme/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const aoOrg = aliasedTable(schema.orgs, "ao_org");
    const workouts = await ctx.db
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
        created: schema.events.created,
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
      })
      .from(schema.events)
      .innerJoin(
        schema.locations,
        eq(schema.locations.id, schema.events.locationId),
      )
      .leftJoin(
        aoOrg,
        and(
          eq(aoOrg.orgType, "ao"),
          or(
            eq(aoOrg.id, schema.locations.orgId),
            eq(aoOrg.id, schema.events.orgId),
          ),
        ),
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
      .groupBy(schema.events.id);
    return workouts;
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
          isSeries: schema.events.isSeries,
          created: schema.events.created,
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
        })
        .from(schema.events)
        .leftJoin(
          schema.locations,
          eq(schema.locations.id, schema.events.locationId),
        )
        .leftJoin(
          aoOrg,
          and(
            eq(aoOrg.orgType, "ao"),
            or(
              eq(aoOrg.id, schema.locations.orgId),
              eq(aoOrg.id, schema.events.orgId),
            ),
          ),
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
        .where(eq(schema.events.id, input.id))
        .groupBy(schema.events.id);

      return event;
    }),
  crupdate: publicProcedure
    .input(EventInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const eventToUpdate: typeof schema.events.$inferInsert = {
        ...input,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.events)
        .values(eventToUpdate)
        .onConflictDoUpdate({
          target: [schema.events.id],
          set: eventToUpdate,
        });
    }),
  types: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(schema.eventTypes);
  }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.events)
        .set({ isActive: false })
        .where(eq(schema.events.id, input.id));
    }),
});
