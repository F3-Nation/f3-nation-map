import { z } from "zod";

import { aliasedTable, eq, schema } from "@f3/db";
import { EventInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const locationOrg = aliasedTable(schema.orgs, "location_org");
    const workouts = await ctx.db
      .select({
        id: schema.events.id,
        name: schema.events.name,
        description: schema.events.description,
        isActive: schema.events.isActive,
        location: schema.locations.name,
        regionName: regionOrg.name,
        regionId: regionOrg.id,
        locationId: schema.events.locationId,
        startDate: schema.events.startDate,
        dayOfWeek: schema.events.dayOfWeek,
        startTime: schema.events.startTime,
        endTime: schema.events.endTime,
        email: schema.events.email,
        created: schema.events.created,
      })
      .from(schema.events)
      .leftJoin(
        schema.locations,
        eq(schema.locations.id, schema.events.locationId),
      )
      .leftJoin(locationOrg, eq(locationOrg.id, schema.locations.orgId))
      .leftJoin(regionOrg, eq(regionOrg.id, locationOrg.parentId));

    return workouts;
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const locationOrg = aliasedTable(schema.orgs, "location_org");
      const [event] = await ctx.db
        .select({
          id: schema.events.id,
          name: schema.events.name,
          description: schema.events.description,
          isActive: schema.events.isActive,
          location: schema.locations.name,
          regionName: regionOrg.name,
          orgId: schema.events.orgId, //region
          locationId: schema.events.locationId,
          startDate: schema.events.startDate,
          dayOfWeek: schema.events.dayOfWeek,
          startTime: schema.events.startTime,
          endTime: schema.events.endTime,
          email: schema.events.email,
          highlight: schema.events.highlight,
          isSeries: schema.events.isSeries,
          created: schema.events.created,
        })
        .from(schema.events)
        .leftJoin(
          schema.locations,
          eq(schema.locations.id, schema.events.locationId),
        )
        .leftJoin(locationOrg, eq(locationOrg.id, schema.locations.orgId))
        .leftJoin(regionOrg, eq(regionOrg.id, locationOrg.parentId))
        .where(eq(schema.events.id, input.id));

      return event;
    }),
  crupdate: publicProcedure
    .input(EventInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const eventToUpdate: typeof schema.events.$inferInsert = input;
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
});
