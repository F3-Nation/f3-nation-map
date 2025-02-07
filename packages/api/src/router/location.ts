import omit from "lodash/omit";
import { z } from "zod";

import { aliasedTable, count, desc, eq, schema, sql } from "@f3/db";
import { env } from "@f3/env";
import { isTruthy } from "@f3/shared/common/functions";

import { mail, Templates } from "../mail";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationRouter = createTRPCRouter({
  getLocations: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
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
  updateLocation: publicProcedure
    .input(
      z.object({
        id: z.string(),
        locationName: z.string().nullish(),
        locationDescription: z.string().nullish(),
        locationLat: z.number().nullish(),
        locationLng: z.number().nullish(),
        locationId: z.number().nullish(),

        eventName: z.string(),
        eventDescription: z.string().nullish(),
        eventStartTime: z.string().nullish(),
        eventEndTime: z.string().nullish(),
        eventDayOfWeek: z.string(),
        eventId: z.number().nullable(),
        eventTypes: z.object({ id: z.number(), name: z.string() }).array(),
        eventTag: z.string().nullable(),
        eventIsSeries: z.boolean().nullish(),
        eventIsActive: z.boolean().nullish(),
        eventHighlight: z.boolean().nullish(),
        eventStartDate: z.string().nullish(),
        eventEndDate: z.string().nullish(),
        eventRecurrencePattern: z.string().nullish(),
        eventRecurrenceInterval: z.number().nullish(),
        eventIndexWithinInterval: z.number().nullish(),
        eventMeta: z.record(z.string(), z.unknown()).nullish(),

        orgId: z.number(),
        submittedBy: z.string().email(),
        meta: z.record(z.string(), z.unknown()).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateRequest: typeof schema.updateRequests.$inferInsert = {
        ...input,
        submitterValidated: false,
        validatedBy: null,
        validatedAt: null,
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
        .where(eq(schema.orgs.id, input.orgId));

      if (!region) {
        throw new Error("Failed to find region");
      }

      await mail.sendTemplateMessages(Templates.validateSubmission, {
        to: input.submittedBy,
        submissionId: inserted.id,
        token: inserted.token,
        regionName: region?.name,
        eventName: inserted.eventName,
        address: inserted.locationDescription ?? "",
        startTime: inserted.eventStartTime ?? "",
        endTime: inserted.eventEndTime ?? "",
        dayOfWeek: inserted.eventDayOfWeek ?? "",
        type: inserted.eventType ?? "",
        url: env.NEXT_PUBLIC_URL,
      });

      return { success: true, inserted: omit(inserted, ["token"]) };
    }),
  validateSubmission: publicProcedure
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

      const [updated] = await ctx.db
        .update(schema.updateRequests)
        .set({ submitterValidated: true })
        .where(eq(schema.updateRequests.id, input.submissionId))
        .returning();

      return { success: true, updateRequest: omit(updated, ["token"]) };
    }),
});
