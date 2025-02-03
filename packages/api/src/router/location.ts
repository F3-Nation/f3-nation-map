import omit from "lodash/omit";
import { z } from "zod";

import { aliasedTable, count, eq, inArray, schema } from "@f3/db";
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
        lat: schema.locations.lat,
        lon: schema.locations.lon,
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
          logo: schema.orgs.logo,
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
          },
          events: {
            id: schema.events.id,
            locationId: schema.events.locationId,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            eventTypeId: schema.events.eventTypeId,
            type: schema.eventTypes.name,
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
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.events.eventTypeId),
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
        const location = {
          ...item.location,
          created: new Date(item.location.created),
          updated: new Date(item.location.updated),
        };
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
  getRegions: publicProcedure.query(async ({ ctx }) => {
    const regions = await ctx.db
      .select()
      .from(schema.orgs)
      .innerJoin(schema.orgTypes, eq(schema.orgs.orgTypeId, schema.orgTypes.id))
      .where(eq(schema.orgTypes.name, "Region"));
    return regions.map((region) => ({
      id: region.orgs.id,
      name: region.orgs.name,
      logo: region.orgs.logo,
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
        lat: schema.locations.lat,
        lon: schema.locations.lon,
        logo: ao.logo,
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
          },
          events: {
            id: schema.events.id,
            locationId: schema.events.locationId,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            eventTypeId: schema.events.eventTypeId,
            type: schema.eventTypes.name,
            name: schema.events.name,
          },
          // locations: { id: schema.locations.id },
          // events: { id: schema.events.id },
        })
        .from(schema.locations)
        .where(eq(schema.orgs.parentId, input.regionId))
        .innerJoin(
          schema.events,
          eq(schema.events.locationId, schema.locations.id),
        )
        .leftJoin(schema.orgs, eq(schema.locations.orgId, schema.orgs.id))
        .leftJoin(
          schema.eventTypes,
          eq(schema.eventTypes.id, schema.events.eventTypeId),
        );
      // const locationEvents = locationsAndEvents.reduce(
      //   (acc, item) => {
      //     return [
      //       ...acc,
      //       item.events.map((event) => {
      //         return {
      //           ...item.locations,
      //           events: [...(acc[item.locations.id]?.events ?? []), event],
      //         };
      //       }),
      //     ];
      //   },
      //   [] as ((typeof locationsAndEvents)[0]["locations"] &
      //     (typeof locationsAndEvents)[0]["events"])[],
      // );
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
        eventType: z.string().nullable(),
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
