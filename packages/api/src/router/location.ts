import { z } from "zod";

import { aliasedTable, eq, inArray, schema } from "@f3/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationRouter = createTRPCRouter({
  getLocations: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getLocationMarkersSparse: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: schema.locations.id,
        lat: schema.locations.lat,
        lon: schema.locations.lon,
      })
      .from(schema.locations);
  }),
  getAllLocationMarkers: publicProcedure.query(async ({ ctx }) => {
    const [locations, events] = await Promise.all([
      ctx.db
        .select({
          id: schema.locations.id,
          lat: schema.locations.lat,
          lon: schema.locations.lon,
          name: schema.locations.name,
          isActive: schema.locations.isActive,
          created: schema.locations.created,
          updated: schema.locations.updated,
          meta: schema.locations.meta,
          locationDescription: schema.locations.description,
          orgId: schema.locations.orgId,
          logo: schema.orgs.logo,
          website: schema.orgs.website,
        })
        .from(schema.locations)
        .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id)),
      ctx.db
        .select({
          id: schema.events.id,
          locationId: schema.events.locationId,
          dayOfWeek: schema.events.dayOfWeek,
          startTime: schema.events.startTime,
          endTime: schema.events.endTime,
          description: schema.events.description,
          eventTypeId: schema.events.eventTypeId,
          type: schema.eventTypes.name,
          name: schema.events.name,
        })
        .from(schema.events)
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.events.eventTypeId),
        ),
    ]);
    // console.log("locations", locations.length, locations[0]);
    // console.log("events", events.length, events[0]);

    // combine locations and events
    const locationEvents = locations.map((location) => {
      const eventsForThisLocation = events
        .filter((event) => event.locationId === location.id)
        .map((event) => ({ ...event, logo: location.logo }));
      return {
        ...location,
        events: eventsForThisLocation,
      };
    });
    console.log("locationEvents", locationEvents.length);

    return locationEvents;
  }),
  getPreviewLocations: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select({
        location: schema.locations,
        event: schema.events,
        type: schema.eventTypes.name,
        website: schema.orgs.website,
        logo: schema.orgs.logo,
        locationDescription: schema.locations.description,
      })
      .from(schema.locations)
      .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id))
      .leftJoin(
        schema.events,
        eq(schema.events.locationId, schema.locations.id),
      )
      .leftJoin(
        schema.eventTypes,
        eq(schema.eventTypes.id, schema.events.eventTypeId),
      )
      .where(inArray(schema.locations.id, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

    const locationEvents = data.reduce(
      (acc, item) => {
        const location = item.location;
        const event = item.event;
        if (!acc[location.id]) {
          acc[location.id] = {
            location: {
              ...location,
              website: item.website,
              logo: item.logo,
              locationDescription: item.locationDescription,
            },
            events: [],
          };
        }
        if (event) {
          acc[location.id]?.events.push({
            ...event,
            type: item.type,
            logo: item.logo,
          });
        }
        return acc;
      },
      {} as Record<
        string,
        {
          location: {
            id: number;
            lat: number | null;
            lon: number | null;
            name: string;
            isActive: boolean;
            created: Date | null;
            updated: Date | null;
            meta: unknown;
            locationDescription: string | null;
            orgId: number | null;
            logo: string | null;
            website: string | null;
          };
          events: {
            id: number;
            locationId: number | null;
            dayOfWeek: number | null;
            startTime: string | null;
            endTime: string | null;
            description: string | null;
            eventTypeId: number | null;
            type: string | null;
            name: string;
            logo: string | null;
          }[];
        }
      >,
    );

    return Object.values(locationEvents).map((item) => ({
      ...item.location,
      distance: 0,
      events: item.events,
    }));
  }),
  getAoWorkoutData: publicProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const ao = aliasedTable(schema.orgs, "ao");
      const region = aliasedTable(schema.orgs, "region");
      const [[location], events] = await Promise.all([
        ctx.db
          .select({
            locationId: schema.locations.id,
            lat: schema.locations.lat,
            lon: schema.locations.lon,
            locationName: schema.locations.name,
            locationMeta: schema.locations.meta,
            locationAddress: schema.locations.description,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,

            aoId: ao.id,
            aoLogo: ao.logo,
            aoWebsite: ao.website,
            aoName: ao.name,

            regionId: region.id,
            regionLogo: region.logo,
            regionWebsite: region.website,
            regionName: region.name,
          })
          .from(schema.locations)
          .where(eq(schema.locations.id, input.locationId))
          .leftJoin(ao, eq(schema.locations.orgId, ao.id))
          .leftJoin(region, eq(ao.parentId, region.id)),
        ctx.db
          .select({
            eventId: schema.events.id,
            eventName: schema.events.name,
            eventAddress: schema.events.description,
            eventMeta: schema.events.meta,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            eventTypeId: schema.events.eventTypeId,
            type: schema.eventTypes.name,
          })
          .from(schema.events)
          .where(eq(schema.events.locationId, input.locationId))
          .leftJoin(
            schema.eventTypes,
            eq(schema.eventTypes.id, schema.events.eventTypeId),
          ),
      ]);

      if (!location) {
        return null;
      }
      return { location, events };
    }),
});
