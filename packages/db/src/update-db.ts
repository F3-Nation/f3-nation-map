import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { env } from "@f3/env";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { isTruthy, safeParseFloat } from "@f3/shared/common/functions";

import type { InferInsertModel } from ".";
import type {
  RegionSheetData,
  WorkoutSheetData,
} from "./utils/get-location-data-gravity-forms";
import { db, eq, inArray, schema, sql } from ".";
import { getLocationDataFromGravityForms } from "./utils/get-location-data-gravity-forms";

dayjs.extend(customParseFormat);

interface AO {
  orgId: number | null;
  locationId: number | null;
  regionId: number;
  latitude: string | null;
  longitude: string | null;
  key: string;
}

type UniqueAOsWithWorkouts = Record<
  string,
  {
    ao: AO;
    events: WorkoutSheetData[];
  }
>;

if (!("DATABASE_URL" in env))
  throw new Error("DATABASE_URL not found on .env.development");

export const updateDb = async () => {
  const { regionData, workoutData } = await getLocationDataFromGravityForms();
  console.log(
    "about to insert new data",
    regionData.length,
    workoutData.length,
  );
  await insertNewData({ regionData, workoutData });
};

if (require.main === module) {
  void updateDb()
    .then(() => UPDATE_DB_LOGS && console.log("Update done"))
    .catch((e) => {
      UPDATE_DB_LOGS && console.log("Update failed", e);
    })
    .finally(() => {
      process.exit();
    });
}
const UPDATE_DB_LOGS = true;

enum OrgTypes {
  AO = "AO",
  Region = "Region",
  Area = "Area",
  Sector = "Sector",
}

export async function insertNewData(data: {
  workoutData: WorkoutSheetData[];
  regionData: RegionSheetData[];
}) {
  const orgTypes = await db.select().from(schema.orgTypes);
  const eventTypes = await db.select().from(schema.eventTypes);

  const orgTypesDict = orgTypes.reduce(
    (acc, orgType) => {
      acc[orgType.name as OrgTypes] = orgType.id;
      return acc;
    },
    {} as Record<OrgTypes, number>,
  );

  const { workoutData, regionData } = data;

  const regionOrgTypeId = orgTypesDict[OrgTypes.Region];
  if (regionOrgTypeId === undefined) {
    throw new Error("Region org type not found");
  }

  const aoOrgTypeId = orgTypesDict[OrgTypes.AO];
  if (aoOrgTypeId === undefined) {
    throw new Error("AO org type not found");
  }

  console.log("about to get existing regions");
  const existingRegions = await db
    .select()
    .from(schema.orgs)
    .where(eq(schema.orgs.orgTypeId, regionOrgTypeId));

  const regionsToInsert = regionData.map((region) => {
    const regionData: InferInsertModel<typeof schema.orgs> = {
      id: existingRegions.find((er) => er.name === region["Region Name"])?.id,
      name: region["Region Name"] ?? "",
      isActive: true,
      orgTypeId:
        orgTypes.find((ot) => ot.name === OrgTypes.Region.toString())?.id ?? -1, // shouldn't ever happen
      website: region.Website,
      email: region["Region Email"],
      description: undefined, // NOTE: currently no region descriptions
      logo: undefined, // NOTE: currently no region logos
      parentId: undefined, // NOTE: maybe this should be a sector?
    };
    return regionData;
  });

  console.log("about to insert regions");
  const regions = await db
    .insert(schema.orgs)
    .values(regionsToInsert)
    .onConflictDoUpdate({
      target: [schema.orgs.id],
      set: {
        name: sql`excluded.name`,
        isActive: sql`excluded.is_active`,
        orgTypeId: sql`excluded.org_type_id`,
        website: sql`excluded.website`,
        email: sql`excluded.email`,
      },
    })
    .returning({ id: schema.orgTypes.id, name: schema.orgTypes.name });

  console.log("upserted regions", regions.length, regions[0]?.name);

  const existingAOs = await db
    .select()
    .from(schema.orgs)
    .innerJoin(schema.locations, eq(schema.orgs.id, schema.locations.orgId))
    .where(eq(schema.orgs.orgTypeId, aoOrgTypeId));

  console.log("about to get existing aos");
  const existingAOsByLatLonKey = existingAOs.reduce<UniqueAOsWithWorkouts>(
    (acc, ao) => {
      const latLonKey: string | undefined = ao.orgs.meta?.latLonKey;
      if (latLonKey === undefined) return acc;
      acc[latLonKey] = {
        ao: {
          orgId: ao.orgs.id,
          locationId: ao.locations.id,
          regionId: ao.orgs.parentId ?? -1,
          latitude: ao.locations.lat?.toString() ?? null,
          longitude: ao.locations.lon?.toString() ?? null,
          key: latLonKey,
        },
        events: [],
      };
      return acc;
    },
    {},
  );

  console.log(
    "Got existing aos",
    Object.keys(existingAOsByLatLonKey).length,
    Object.entries(existingAOsByLatLonKey).slice(0, 4),
  );

  const uniqueAOsWithWorkouts = workoutData.reduce<UniqueAOsWithWorkouts>(
    (acc, workout) => {
      const workoutRegionId = regions.find(
        (region) => region.name === workout.Region,
      )?.id;
      const latLonKey = getLatLonKey({
        latitude: workout.Latitude,
        longitude: workout.Longitude,
      });
      if (workoutRegionId === undefined || latLonKey === undefined) return acc;
      // console.log("workoutRegionId", workoutRegionId, latLonKey);
      if (!acc[latLonKey]) {
        acc[latLonKey] = {
          ao: {
            orgId: null,
            locationId: null,
            regionId: workoutRegionId,
            latitude: workout.Latitude,
            longitude: workout.Longitude,
            key: latLonKey,
          },
          events: [],
        };
      }
      acc[latLonKey]?.events.push(workout);
      return acc;
    },
    // start with existing aos
    existingAOsByLatLonKey,
  );

  console.log(
    "updated uniqueAOsWithWorkouts",
    Object.keys(uniqueAOsWithWorkouts).length,
    JSON.stringify(Object.entries(uniqueAOsWithWorkouts).slice(0, 4), null, 2),
  );

  const aosToRemove = Object.entries(existingAOsByLatLonKey).filter(
    ([, aoAndEvents]) =>
      aoAndEvents.ao.orgId !== null && aoAndEvents.events.length === 0,
  );
  console.log("aos to remove", aosToRemove.length, aosToRemove[0]);
  if (aosToRemove.length > 0) {
    await db
      .delete(schema.orgs)
      .where(
        inArray(
          schema.orgs.id,
          aosToRemove
            .map(([_, aoAndEvents]) => aoAndEvents.ao.orgId)
            .filter(isTruthy),
        ),
      );
  }

  console.log("about to upsert aos");
  const aoOrgs = await db
    .insert(schema.orgs)
    .values(
      Object.values(uniqueAOsWithWorkouts).map(({ ao, events }) => {
        const address = [
          events[0]?.["Address 1"],
          events[0]?.["Address 2"],
          events[0]?.City,
          events[0]?.State,
          events[0]?.["Postal Code"],
          events[0]?.Country,
        ]
          .filter(isTruthy)
          .join(", ");
        const aoData: InferInsertModel<typeof schema.orgs> = {
          // name: "", // AOs do not have names yet
          id: ao.orgId ?? undefined, // if id is null, we are inserting a new AO
          name: "", // AOs don't have names yes
          isActive: true,
          orgTypeId:
            orgTypes.find((ot) => ot.name === OrgTypes.AO.toString())?.id ?? -1,
          logo: events[0]?.Logo,
          parentId: ao.regionId,
          description: address,
          website: events[0]?.Website,
          meta: {
            latLonKey: ao.key,
            address1: events[0]?.["Address 1"],
            address2: events[0]?.["Address 2"],
            city: events[0]?.City,
            state: events[0]?.State,
            postalCode: events[0]?.["Postal Code"],
            country: events[0]?.Country,
          },
        };
        return aoData;
      }),
    )
    .onConflictDoUpdate({
      target: [schema.orgs.id],
      set: {
        name: sql`excluded.name`,
        isActive: sql`excluded.is_active`,
        orgTypeId: sql`excluded.org_type_id`,
        logo: sql`excluded.logo`,
        parentId: sql`excluded.parent_id`,
        description: sql`excluded.description`,
        website: sql`excluded.website`,
        meta: sql`excluded.meta`,
      },
    })
    .returning();

  console.log("upserted ao orgs", aoOrgs.length, aoOrgs[0]?.id);

  const aoOrgKeyDict = aoOrgs.reduce(
    (acc, aoOrg) => {
      const latLonKey = (aoOrg.meta as { latLonKey?: string | undefined })
        ?.latLonKey;
      if (!latLonKey) return acc;
      acc[latLonKey] = aoOrg;
      return acc;
    },
    {} as Record<string, { id: number; description: string | null }>,
  );

  console.log("about to upsert aos (locations)");
  const aoLocs = await db
    .insert(schema.locations)
    .values(
      Object.values(uniqueAOsWithWorkouts).map(({ ao, events }) => {
        const aoOrg = aoOrgKeyDict[ao.key];
        const aoData: InferInsertModel<typeof schema.locations> = {
          id: ao.locationId ?? undefined,
          name: "", // AO locations do not have names yet (should be "Walgreens" etc)
          isActive: true,
          description: aoOrg?.description, // AOs description is the address
          lat: safeParseFloat(ao.latitude),
          lon: safeParseFloat(ao.longitude),
          orgId: aoOrg?.id ?? 0,
          meta: {
            latLonKey: ao.key,
            address1: events[0]?.["Address 1"],
            address2: events[0]?.["Address 2"],
            city: events[0]?.City,
            state: events[0]?.State,
            postalCode: events[0]?.["Postal Code"],
            country: events[0]?.Country,
          },
        };
        return aoData;
      }),
    )
    .onConflictDoUpdate({
      target: [schema.locations.id],
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        lat: sql`excluded.lat`,
        lon: sql`excluded.lon`,
        orgId: sql`excluded.org_id`,
        meta: sql`excluded.meta`,
      },
    })
    .returning();

  console.log("upserted aos (locations)", aoLocs.length, aoLocs[0]);

  await db.delete(schema.events);
  console.log("deleted events");

  console.log("about to insert events");
  const eventsToInsert: InferInsertModel<typeof schema.events>[] =
    Object.values(uniqueAOsWithWorkouts).flatMap(({ ao, events }) => {
      return events.map((workout) => {
        const dayOfWeek = DAY_ORDER.indexOf(workout.Weekday);
        const workoutAoLoc = aoLocs.find(
          (aoItem) =>
            ao.key ===
            getLatLonKey({ latitude: aoItem.lat, longitude: aoItem.lon }),
        );

        const [startTimeRaw, endTimeRaw] = workout.Time.split("-").map((time) =>
          time.trim(),
        );
        // .format("HH:mm:ss")
        const startTime = startTimeRaw
          ? dayjs(startTimeRaw.toLowerCase(), "hh:mm a")
          : undefined;
        const endTime = endTimeRaw
          ? dayjs(endTimeRaw.toLowerCase(), "hh:mm a")
          : undefined;
        const workoutItem: InferInsertModel<typeof schema.events> = {
          locationId: workoutAoLoc?.id, // locationIdDict[workout.Location],
          isActive: true,
          isSeries: true,
          highlight: false,
          startDate: dayjs().format("YYYY-MM-DD"), // You might want to set a specific start date
          dayOfWeek,
          startTime: startTime?.isValid() ? startTime.format("h:mm a") : null,
          endTime: endTime?.isValid() ? endTime.format("h:mm a") : null,
          name: workout["Workout Name"].slice(0, 100),
          eventTypeId: eventTypes.find((et) => et.name === workout.Type)?.id, // Bootcamp
          description: workout.Note,
          recurrencePattern: "weekly",
          orgId: ao.regionId,
        };
        return workoutItem;
      });
    });
  console.log(
    "events to insert:",
    eventsToInsert.length,
    eventsToInsert[0]?.name,
  );

  const chunkSize = 1000;
  for (let i = 0; i < eventsToInsert.length; i += chunkSize) {
    const eventsChunk = eventsToInsert.slice(i, i + chunkSize);
    await db.insert(schema.events).values(eventsChunk).returning();
    console.log("inserted events", i + eventsChunk.length);
  }
}

const getLatLonKey = ({
  latitude,
  longitude,
}: {
  latitude: number | string | null;
  longitude: number | string | null;
}) => {
  const latNum =
    typeof latitude === "number" ? latitude : safeParseFloat(latitude);
  const lonNum =
    typeof longitude === "number" ? longitude : safeParseFloat(longitude);
  const latStr = latNum?.toFixed(4); // 4 digits is 11m
  const lonStr = lonNum?.toFixed(4); // 4 digits is 11m
  if (latStr === undefined || lonStr === undefined) {
    return undefined;
  }
  return `${latStr},${lonStr}`;
};
