import omit from "lodash/omit";
import { z } from "zod";

import { aliasedTable, count, desc, eq, schema, sql } from "@f3/db";
import { isTruthy } from "@f3/shared/common/functions";
import { LocationInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationRouter = createTRPCRouter({
  getLocationMarkersSparse: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: schema.locations.id,
        lat: schema.locations.latitude,
        lon: schema.locations.longitude,
        locationDescription: schema.locations.description,
      })
      .from(schema.locations);
  }),
  allLocationMarkerFilterData: publicProcedure.query(async ({ ctx }) => {
    const [locations, events] = await Promise.all([
      ctx.db
        .select({
          id: schema.locations.id,
          name: schema.locations.name,
          logo: schema.orgs.logoUrl,
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
          types: sql<
            { id: number; name: string }[]
          >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
          name: schema.events.name,
        })
        .from(schema.events)
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventsXEventTypes.eventId, schema.events.id),
        )
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .groupBy(schema.events.id),
    ]);
    // console.log("locations", locations.length, locations[0]);
    // console.log("events", events.length, events[0]);

    // combine locations and events
    const locationEvents = locations.map((location) => {
      const eventsForThisLocation = events.filter(
        (event) => event.locationId === location.id,
      );
      return {
        ...location,
        events: eventsForThisLocation,
      };
    });

    return locationEvents;
  }),
  getLocationMarker: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const locationsAndEvents = await ctx.db
        .select({
          // TODO: Reduce the properties as much as possible
          locations: {
            id: schema.locations.id,
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            name: schema.locations.name,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            meta: schema.locations.meta,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,
            logo: schema.orgs.logoUrl,
            website: schema.orgs.website,
          },
          events: {
            id: schema.events.id,
            locationId: schema.events.locationId,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            types: sql<
              { id: number; name: string }[]
            >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
            name: schema.events.name,
          },
          // locations: { id: schema.locations.id },
          // events: { id: schema.events.id },
        })
        .from(schema.locations)
        .where(eq(schema.locations.id, input.id))
        .innerJoin(
          schema.events,
          eq(schema.events.locationId, schema.locations.id),
        )
        .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id))
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventsXEventTypes.eventId, schema.events.id),
        )
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .groupBy(
          schema.events.id,
          schema.locations.id,
          schema.orgs.logoUrl,
          schema.orgs.website,
        );
      const locationEvents = locationsAndEvents.reduce(
        (acc, item) => {
          const location = item.locations;
          const event = item.events;
          acc[location.id] = {
            ...location,
            events: [...(acc[location.id]?.events ?? []), event],
          };
          return acc;
        },
        {} as Record<
          number,
          (typeof locationsAndEvents)[0]["locations"] & {
            events: (typeof locationsAndEvents)[0]["events"][];
          }
        >,
      );
      return locationEvents[input.id];
    }),
  // getAllLocationMarkersBackup: publicProcedure.query(async ({ ctx }) => {
  //   const [locations, events] = await Promise.all([
  //     ctx.db
  //       .select({
  //         id: schema.locations.id,
  //         lat: schema.locations.lat,
  //         lon: schema.locations.lon,
  //         name: schema.locations.name,
  //         isActive: schema.locations.isActive,
  //         created: schema.locations.created,
  //         updated: schema.locations.updated,
  //         meta: schema.locations.meta,
  //         locationDescription: schema.locations.description,
  //         orgId: schema.locations.orgId,
  //         logo: schema.orgs.logo,
  //         website: schema.orgs.website,
  //       })
  //       .from(schema.locations)
  //       .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id)),
  //     ctx.db
  //       .select({
  //         id: schema.events.id,
  //         locationId: schema.events.locationId,
  //         dayOfWeek: schema.events.dayOfWeek,
  //         startTime: schema.events.startTime,
  //         endTime: schema.events.endTime,
  //         description: schema.events.description,
  //         eventTypeId: schema.events.eventTypeId,
  //         type: schema.eventTypes.name,
  //         name: schema.events.name,
  //       })
  //       .from(schema.events)
  //       .leftJoin(
  //         schema.eventTypes,
  //         eq(schema.eventTypes.id, schema.events.eventTypeId),
  //       ),
  //   ]);
  //   // console.log("locations", locations.length, locations[0]);
  //   // console.log("events", events.length, events[0]);

  //   // combine locations and events
  //   const locationEvents = locations.map((location) => {
  //     const eventsForThisLocation = events
  //       .filter((event) => event.locationId === location.id)
  //       .map((event) => ({ ...event, logo: location.logo }));
  //     return {
  //       ...location,
  //       events: eventsForThisLocation,
  //     };
  //   });

  //   return locationEvents;
  // }),
  getPreviewLocations: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.db
      .select({
        id: schema.events.id,
        location: {
          id: schema.locations.id,
          lat: schema.locations.latitude,
          lon: schema.locations.longitude,
          name: schema.locations.name,
          isActive: schema.locations.isActive,
          created: schema.locations.created,
          updated: schema.locations.updated,
          meta: schema.locations.meta,
          locationDescription: schema.locations.description,
          orgId: schema.locations.orgId,
          logo: schema.orgs.logoUrl,
          website: schema.orgs.website,
        },
        dayOfWeek: schema.events.dayOfWeek,
        startTime: schema.events.startTime,
        endTime: schema.events.endTime,
        description: schema.events.description,
        name: schema.events.name,
        types: sql<
          { id: number; name: string }[]
        >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
        logo: schema.orgs.logoUrl,
      })
      .from(schema.events)
      .innerJoin(
        schema.locations,
        eq(schema.events.locationId, schema.locations.id),
      )
      .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id))
      .leftJoin(
        schema.eventsXEventTypes,
        eq(schema.eventsXEventTypes.eventId, schema.events.id),
      )
      .leftJoin(
        schema.eventTypes,
        eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
      )
      .groupBy(
        schema.events.id,
        schema.locations.id,
        schema.orgs.logoUrl,
        schema.orgs.website,
      )
      .orderBy(desc(schema.events.id))
      .limit(30);

    const previewLocations = events.reduce(
      (acc, item) => {
        acc[item.location.id] = {
          ...item.location,
          distance: 0,
          events: [
            ...(acc[item.location.id]?.events ?? []),
            {
              id: item.id,
              name: item.name,
              dayOfWeek: item.dayOfWeek,
              startTime: item.startTime,
              types: item.types,
            },
          ],
        };
        return acc;
      },
      {} as Record<
        number,
        {
          id: number;
          lat: number | null;
          lon: number | null;
          logo: string | null;
          locationDescription: string | null;
          distance: number;
          events: {
            id: number;
            name: string;
            dayOfWeek: number | null;
            startTime: string | null;
            types: { id: number; name: string }[];
          }[];
        }
      >,
    );

    return Object.values(previewLocations);
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
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            locationName: schema.locations.name,
            locationMeta: schema.locations.meta,
            locationAddress: schema.locations.description,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,

            aoId: ao.id,
            aoLogo: ao.logoUrl,
            aoWebsite: ao.website,
            aoName: ao.name,

            regionId: region.id,
            regionLogo: region.logoUrl,
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
            types: sql<
              { id: number; name: string }[]
            >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
          })
          .from(schema.events)
          .where(eq(schema.events.locationId, input.locationId))
          .leftJoin(
            schema.eventsXEventTypes,
            eq(schema.eventsXEventTypes.eventId, schema.events.id),
          )
          .leftJoin(
            schema.eventTypes,
            eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
          )
          .groupBy(schema.events.id),
      ]);

      if (!location) {
        return null;
      }
      return { location, events };
    }),
  getRegions: publicProcedure.query(async ({ ctx }) => {
    const regions = await ctx.db
      .select()
      .from(schema.orgs)
      .innerJoin(schema.orgTypes, eq(schema.orgs.orgTypeId, schema.orgTypes.id))
      .where(eq(schema.orgTypes.name, "Region"));
    return regions.map((region) => ({
      id: region.orgs.id,
      name: region.orgs.name,
      logo: region.orgs.logoUrl,
      website: region.orgs.website,
    }));
  }),
  getRegionsWithLocation: publicProcedure.query(async ({ ctx }) => {
    const ao = aliasedTable(schema.orgs, "ao");
    const region = aliasedTable(schema.orgs, "region");
    const regionsWithLocation = await ctx.db
      .select({
        id: region.id,
        name: region.name,
        locationId: schema.locations.id,
        lat: schema.locations.latitude,
        lon: schema.locations.longitude,
        logo: ao.logoUrl,
      })
      .from(region)
      .innerJoin(ao, eq(ao.parentId, region.id))
      .innerJoin(schema.locations, eq(schema.locations.orgId, ao.id));

    const uniqueRegionsWithLocation = regionsWithLocation
      .map((rwl) =>
        typeof rwl.lat === "number" && typeof rwl.lon === "number"
          ? {
              ...rwl,
              lat: rwl.lat,
              lon: rwl.lon,
            }
          : null,
      )
      .filter(isTruthy)
      .filter(
        (region, index, self) =>
          index ===
          self.findIndex((t) => t.id === region.id && t.name === region.name),
      );
    return uniqueRegionsWithLocation;
  }),
  getRegionAos: publicProcedure
    .input(z.object({ regionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const locationsAndEvents = await ctx.db
        .select({
          // TODO: Reduce the properties as much as possible
          locations: {
            id: schema.locations.id,
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            name: schema.locations.name,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            meta: schema.locations.meta,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,
            logo: schema.orgs.logoUrl,
            website: schema.orgs.website,
          },
          events: {
            id: schema.events.id,
            locationId: schema.events.locationId,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            name: schema.events.name,
            types: sql<
              { id: number; name: string }[]
            >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
          },
        })
        .from(schema.locations)
        .where(eq(schema.orgs.parentId, input.regionId))
        .innerJoin(
          schema.events,
          eq(schema.events.locationId, schema.locations.id),
        )
        .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id))
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventsXEventTypes.eventId, schema.events.id),
        )
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        )
        .groupBy(
          schema.events.id,
          schema.locations.id,
          schema.orgs.logoUrl,
          schema.orgs.website,
        );
      return locationsAndEvents;
    }),
  getWorkoutCount: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ count: count() })
      .from(schema.events);

    return { count: result?.count };
  }),

  all: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const locationOrg = aliasedTable(schema.orgs, "location_org");

    const [locations, events] = await Promise.all([
      ctx.db
        .select({
          id: schema.locations.id,
          name: schema.locations.name,
          regionName: regionOrg.name,
          description: schema.locations.description,
          isActive: schema.locations.isActive,
          latitude: schema.locations.latitude,
          longitude: schema.locations.longitude,
          email: schema.locations.email,
          addressStreet: schema.locations.addressStreet,
          addressStreet2: schema.locations.addressStreet2,
          addressCity: schema.locations.addressCity,
          addressState: schema.locations.addressState,
          addressZip: schema.locations.addressZip,
          addressCountry: schema.locations.addressCountry,
          meta: schema.locations.meta,
          created: schema.locations.created,
        })
        .from(schema.locations)
        .leftJoin(locationOrg, eq(schema.locations.orgId, locationOrg.id))
        .leftJoin(regionOrg, eq(locationOrg.parentId, regionOrg.id)),
      ctx.db
        .select({
          id: schema.events.id,
          locationId: schema.events.locationId,
          dayOfWeek: schema.events.dayOfWeek,
          startTime: schema.events.startTime,
          type: schema.eventTypes.name,
          name: schema.events.name,
        })
        .from(schema.events)
        .leftJoin(
          schema.eventsXEventTypes,
          eq(schema.eventsXEventTypes.eventId, schema.events.id),
        )
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.eventsXEventTypes.eventTypeId),
        ),
    ]);
    // console.log("locations", locations.length, locations[0]);
    // console.log("events", events.length, events[0]);

    // combine locations and events
    const locationEvents = locations.map((location) => {
      const eventsForThisLocation = events.filter(
        (event) => event.locationId === location.id,
      );
      return {
        ...location,
        events: eventsForThisLocation,
      };
    });

    return locationEvents;

    // const events = await ctx.db
    //   .select()
    //   .from(schema.events)
    // return { locations, events };
  }),
  allActive: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const locationOrg = aliasedTable(schema.orgs, "location_org");

    const [locations] = await Promise.all([
      ctx.db
        .select({
          id: schema.locations.id,
          name: schema.locations.name,
          regionId: regionOrg.id,
        })
        .from(schema.locations)
        .leftJoin(locationOrg, eq(schema.locations.orgId, locationOrg.id))
        .leftJoin(regionOrg, eq(locationOrg.parentId, regionOrg.id))
        .where(eq(schema.locations.isActive, true))
        .orderBy(schema.locations.name),
    ]);
    return locations;
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const locationOrg = aliasedTable(schema.orgs, "location_org");
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const [location] = await ctx.db
        .select({
          id: schema.locations.id,
          name: schema.locations.name,
          description: schema.locations.description,
          isActive: schema.locations.isActive,
          created: schema.locations.created,
          regionId: regionOrg.id,
          regionName: regionOrg.name,
          email: schema.locations.email,
          latitude: schema.locations.latitude,
          longitude: schema.locations.longitude,
          addressStreet: schema.locations.addressStreet,
          addressCity: schema.locations.addressCity,
          addressState: schema.locations.addressState,
          addressZip: schema.locations.addressZip,
          addressCountry: schema.locations.addressCountry,
          meta: schema.locations.meta,
        })
        .from(schema.locations)
        .where(eq(schema.locations.id, input.id))
        .leftJoin(locationOrg, eq(locationOrg.id, schema.locations.orgId))
        .leftJoin(regionOrg, eq(regionOrg.id, locationOrg.parentId));

      return location;
    }),
  crupdate: publicProcedure
    .input(LocationInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .insert(schema.locations)
        .values(input)
        .onConflictDoUpdate({
          target: [schema.locations.id],
          set: input,
        })
        .returning();

      return { success: true, inserted: omit(updated, ["token"]) };
    }),
});
