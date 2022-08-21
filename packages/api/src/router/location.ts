import { eq, schema } from "@f3/db";

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
});
