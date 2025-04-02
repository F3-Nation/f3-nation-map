import { TRPCError } from "@trpc/server";
import omit from "lodash/omit";
import { z } from "zod";

import type { LowBandwidthF3Marker } from "@acme/validators";
import {
  aliasedTable,
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  or,
  schema,
  sql,
} from "@acme/db";
import { DayOfWeek } from "@acme/shared/app/enums";
import { isTruthy } from "@acme/shared/common/functions";
import { LocationInsertSchema, SortingSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { getSortingColumns } from "../get-sorting-columns";
import {
  adminProcedure,
  createTRPCRouter,
  editorProcedure,
  publicProcedure,
} from "../trpc";
import { withPagination } from "../with-pagination";

export const locationRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z
        .object({
          searchTerm: z.string().optional(),
          pageIndex: z.number().optional(),
          pageSize: z.number().optional(),
          sorting: SortingSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const limit = input?.pageSize ?? 10;
      const offset = (input?.pageIndex ?? 0) * limit;
      const usePagination =
        input?.pageIndex !== undefined && input?.pageSize !== undefined;
      const where = and(
        eq(schema.locations.isActive, true),
        input?.searchTerm
          ? or(
              ilike(schema.locations.name, `%${input?.searchTerm}%`),
              ilike(schema.locations.description, `%${input?.searchTerm}%`),
            )
          : undefined,
      );

      const sortedColumns = getSortingColumns(
        input?.sorting,
        {
          id: schema.locations.id,
          name: schema.locations.name,
          regionName: regionOrg.name,
          aoName: aoOrg.name,
          isActive: schema.locations.isActive,
          latitude: schema.locations.latitude,
          longitude: schema.locations.longitude,
          addressStreet: schema.locations.addressStreet,
          addressStreet2: schema.locations.addressStreet2,
          addressCity: schema.locations.addressCity,
          addressState: schema.locations.addressState,
          addressZip: schema.locations.addressZip,
          addressCountry: schema.locations.addressCountry,
          created: schema.locations.created,
        },
        "id",
      );

      const select = {
        id: schema.locations.id,
        locationName: schema.locations.name,
        aoId: aoOrg.id,
        aoName: aoOrg.name,
        regionId: regionOrg.id,
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
      };

      const [locationCount] = await ctx.db
        .select({ count: count() })
        .from(schema.locations)
        .where(where);

      const query = ctx.db
        .select(select)
        .from(schema.locations)
        .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
        .leftJoin(regionOrg, eq(aoOrg.parentId, regionOrg.id))
        .where(where);

      const locations = usePagination
        ? await withPagination(query.$dynamic(), sortedColumns, offset, limit)
        : await query;

      return { locations, total: locationCount?.count ?? 0 };
    }),
  getMapEventAndLocationData: publicProcedure.query(async ({ ctx }) => {
    const aoOrg = aliasedTable(schema.orgs, "ao_org");
    const locationsAndEvents = await ctx.db
      .select({
        locations: {
          id: schema.locations.id,
          name: aoOrg.name,
          logo: aoOrg.logoUrl,
          lat: schema.locations.latitude,
          lon: schema.locations.longitude,
          locationDescription: schema.locations.description,
        },
        events: {
          id: schema.events.id,
          locationId: schema.events.locationId,
          dayOfWeek: schema.events.dayOfWeek,
          startTime: schema.events.startTime,
          endTime: schema.events.endTime,
          name: schema.events.name,
          types: sql<string[]>`json_agg(${schema.eventTypes.name})`,
        },
      })
      .from(schema.locations)
      .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
      .leftJoin(
        schema.events,
        and(
          eq(schema.events.locationId, schema.locations.id),
          eq(schema.events.isActive, true),
          eq(schema.events.isSeries, true),
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
      .groupBy(
        schema.locations.id,
        aoOrg.name,
        aoOrg.logoUrl,
        schema.events.id,
      );

    // Reduce the results into the expected format
    const locationEvents = locationsAndEvents.reduce(
      (acc, item) => {
        const location = item.locations;
        const event = item.events;

        if (!acc[location.id] && location.lat != null && location.lon != null) {
          acc[location.id] = {
            ...location,
            name: location.name ?? "",
            description: location.locationDescription ?? "",
            lat: location.lat,
            lon: location.lon,
            events: [],
          };
        }

        if (event?.id != undefined) {
          acc[location.id]?.events.push(omit(event, "locationId"));
        }

        return acc;
      },
      {} as Record<
        number,
        {
          id: number;
          name: string;
          logo: string | null;
          lat: number;
          lon: number;
          description: string;
          events: Omit<
            NonNullable<(typeof locationsAndEvents)[number]["events"]>,
            "locationId"
          >[];
        }
      >,
    );

    const lowBandwidthLocationEvents: LowBandwidthF3Marker[] = Object.values(
      locationEvents,
    ).map((locationEvent) => [
      locationEvent.id,
      locationEvent.name,
      locationEvent.logo,
      locationEvent.lat,
      locationEvent.lon,
      locationEvent.description,
      locationEvent.events
        .sort(
          (a, b) =>
            DayOfWeek.indexOf(a.dayOfWeek ?? "sunday") -
            DayOfWeek.indexOf(b.dayOfWeek ?? "sunday"),
        )
        .map((event) => [
          event.id,
          event.name,
          event.dayOfWeek,
          event.startTime,
          event.types,
        ]),
    ]);

    return lowBandwidthLocationEvents;
  }),
  getLocationMarker: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const locationsAndEvents = await ctx.db
        .select({
          // TODO: Reduce the properties as much as possible
          locations: {
            id: schema.locations.id,
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            name: aoOrg.name,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            meta: schema.locations.meta,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,
            logo: aoOrg.logoUrl,
            website: aoOrg.website,
          },
          events: {
            id: schema.events.id,
            locationId: schema.events.locationId,
            dayOfWeek: schema.events.dayOfWeek,
            startTime: schema.events.startTime,
            endTime: schema.events.endTime,
            description: schema.events.description,
            types: sql<string[]>`json_agg(${schema.eventTypes.name})`,
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
        .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
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
          aoOrg.logoUrl,
          aoOrg.website,
          aoOrg.name,
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
  getPreviewLocations: publicProcedure.query(async ({ ctx }) => {
    const aoOrg = aliasedTable(schema.orgs, "ao_org");
    const events = await ctx.db
      .select({
        id: schema.events.id,
        location: {
          id: schema.locations.id,
          lat: schema.locations.latitude,
          lon: schema.locations.longitude,
          name: aoOrg.name,
          isActive: schema.locations.isActive,
          created: schema.locations.created,
          updated: schema.locations.updated,
          meta: schema.locations.meta,
          locationDescription: schema.locations.description,
          orgId: schema.locations.orgId,
          logo: aoOrg.logoUrl,
          website: aoOrg.website,
        },
        dayOfWeek: schema.events.dayOfWeek,
        startTime: schema.events.startTime,
        endTime: schema.events.endTime,
        description: schema.events.description,
        name: schema.events.name,
        types: sql<
          { id: number; name: string }[]
        >`json_agg(json_build_object('id', ${schema.eventTypes.id}, 'name', ${schema.eventTypes.name}))`,
        logo: aoOrg.logoUrl,
      })
      .from(schema.events)
      .innerJoin(
        schema.locations,
        eq(schema.events.locationId, schema.locations.id),
      )
      .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
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
        aoOrg.logoUrl,
        aoOrg.website,
        aoOrg.name,
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
            dayOfWeek: DayOfWeek | null;
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
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const [[locationResult], events] = await Promise.all([
        ctx.db
          .select({
            locationId: schema.locations.id,
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            locationMeta: schema.locations.meta,
            locationAddress: schema.locations.addressStreet,
            locationAddress2: schema.locations.addressStreet2,
            locationCity: schema.locations.addressCity,
            locationState: schema.locations.addressState,
            locationZip: schema.locations.addressZip,
            locationCountry: schema.locations.addressCountry,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,

            aoId: aoOrg.id,
            aoLogo: aoOrg.logoUrl,
            aoWebsite: aoOrg.website,
            aoName: aoOrg.name,

            regionId: regionOrg.id,
            regionLogo: regionOrg.logoUrl,
            regionWebsite: regionOrg.website,
            regionName: regionOrg.name,
          })
          .from(schema.locations)
          .where(eq(schema.locations.id, input.locationId))
          .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
          .leftJoin(regionOrg, eq(aoOrg.parentId, regionOrg.id)),
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
            types: sql<string[]>`json_agg(${schema.eventTypes.name})`,
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

      // This also validates that the location is not undefined
      if (
        locationResult?.lat == undefined ||
        locationResult?.lon == undefined
      ) {
        return null;
      }

      const location = {
        ...locationResult,
        events: events.sort(
          (a, b) =>
            DayOfWeek.indexOf(a.dayOfWeek ?? "sunday") -
            DayOfWeek.indexOf(b.dayOfWeek ?? "sunday"),
        ),
        lat: locationResult.lat,
        lon: locationResult.lon,
        fullAddress: [
          locationResult.locationAddress,
          locationResult.locationAddress2,
          locationResult.locationCity,
          locationResult.locationState,
          locationResult.locationZip,
          ["us", "usa", "united states", "united states of america"].includes(
            locationResult.locationCountry
              ?.toLowerCase()
              .replace(/(.| )/g, "") ?? "",
          )
            ? ""
            : locationResult.locationCountry,
        ]
          .filter(Boolean) // Remove empty/null/undefined values
          .join(", ")
          .replace(/, ,/g, ",") // Clean up any double commas
          .replace(/,\s*$/, ""), // Remove trailing comma
      };

      return { location, events };
    }),
  getRegions: publicProcedure.query(async ({ ctx }) => {
    const regions = await ctx.db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.orgType, "region"));
    return regions.map((region) => ({
      id: region.id,
      name: region.name,
      logo: region.logoUrl,
      website: region.website,
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
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const locationsAndEvents = await ctx.db
        .select({
          // TODO: Reduce the properties as much as possible
          locations: {
            id: schema.locations.id,
            lat: schema.locations.latitude,
            lon: schema.locations.longitude,
            name: aoOrg.name,
            isActive: schema.locations.isActive,
            created: schema.locations.created,
            updated: schema.locations.updated,
            meta: schema.locations.meta,
            locationDescription: schema.locations.description,
            orgId: schema.locations.orgId,
            logo: aoOrg.logoUrl,
            website: aoOrg.website,
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
        .where(eq(aoOrg.parentId, input.regionId))
        .innerJoin(
          schema.events,
          eq(schema.events.locationId, schema.locations.id),
        )
        .leftJoin(aoOrg, eq(schema.locations.orgId, aoOrg.id))
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
          aoOrg.logoUrl,
          aoOrg.website,
        );
      console.log(
        "locationsAndEvents",
        locationsAndEvents.length,
        locationsAndEvents[0],
      );
      return locationsAndEvents;
    }),
  getWorkoutCount: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ count: count() })
      .from(schema.events)
      .where(isNotNull(schema.events.locationId));

    return { count: result?.count };
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const aoOrg = aliasedTable(schema.orgs, "ao_org");
      const regionOrg = aliasedTable(schema.orgs, "region_org");
      const [location] = await ctx.db
        .select({
          id: schema.locations.id,
          locationName: schema.locations.name,
          aoName: aoOrg.name,
          description: schema.locations.description,
          isActive: schema.locations.isActive,
          created: schema.locations.created,
          orgId: schema.locations.orgId,
          regionId: regionOrg.id,
          regionName: regionOrg.name,
          email: schema.locations.email,
          latitude: schema.locations.latitude,
          longitude: schema.locations.longitude,
          addressStreet: schema.locations.addressStreet,
          addressStreet2: schema.locations.addressStreet2,
          addressCity: schema.locations.addressCity,
          addressState: schema.locations.addressState,
          addressZip: schema.locations.addressZip,
          addressCountry: schema.locations.addressCountry,
          meta: schema.locations.meta,
        })
        .from(schema.locations)
        .where(eq(schema.locations.id, input.id))
        .leftJoin(aoOrg, eq(aoOrg.id, schema.locations.orgId))
        .leftJoin(regionOrg, eq(regionOrg.id, aoOrg.parentId));

      return location;
    }),
  crupdate: editorProcedure
    .input(LocationInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      if (!input.orgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Parent ID or ID is required",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: input.orgId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this Location",
        });
      }
      const locationToCrupdate: typeof schema.locations.$inferInsert = {
        ...input,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      const [result] = await ctx.db
        .insert(schema.locations)
        .values(locationToCrupdate)
        .onConflictDoUpdate({
          target: [schema.locations.id],
          set: locationToCrupdate,
        })
        .returning();
      return result;
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [location] = await ctx.db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.id, input.id));

      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: location.orgId,
        session: ctx.session,
        db: ctx.db,
        roleName: "admin",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this Location",
        });
      }
      await ctx.db
        .update(schema.locations)
        .set({ isActive: false })
        .where(
          and(
            eq(schema.locations.id, input.id),
            eq(schema.locations.isActive, true),
          ),
        );
    }),
});
