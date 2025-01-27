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
import { db, schema } from ".";
import { getLocationDataFromGravityForms } from "./utils/get-location-data-gravity-forms";

dayjs.extend(customParseFormat);

if (!("DATABASE_URL" in env))
  throw new Error("DATABASE_URL not found on .env.development");

const _reseedFromScratch = async () => {
  const { regionData, workoutData } = await getLocationDataFromGravityForms();
  SEED_LOGS && console.log("Seed start", env.DATABASE_URL);

  await db.delete(schema.nextAuthAccounts);
  await db.delete(schema.nextAuthSessions);
  await db.delete(schema.nextAuthUsers);
  await db.delete(schema.nextAuthVerificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.orgs);
  await db.delete(schema.events);
  await db.delete(schema.attendanceTypes);
  await db.delete(schema.attendance);
  await db.delete(schema.eventCategories);
  await db.delete(schema.eventTags);
  await db.delete(schema.eventTagsXOrg);
  await db.delete(schema.eventTypes);
  await db.delete(schema.eventTypesXOrg);
  await db.delete(schema.locations);
  await db.delete(schema.orgTypes);
  await db.delete(schema.slackUsers);

  await insertDatabaseStructure(workoutData);

  SEED_LOGS && console.log("Inserting data");
  await insertData({ regionData, workoutData });

  SEED_LOGS && console.log("Seed done");
};

export const seed = async () => {
  await _reseedFromScratch();
};

if (require.main === module) {
  void seed()
    .then(() => SEED_LOGS && console.log("Seed done"))
    .catch((e) => {
      SEED_LOGS && console.log("Seed failed", e);
    })
    .finally(() => {
      process.exit();
    });
}
const SEED_LOGS = false;

enum OrgTypes {
  AO = "AO",
  Region = "Region",
  Area = "Area",
  Sector = "Sector",
}

enum EventTypes {
  Bootcamp = "Bootcamp",
  Run = "Run",
  Ruck = "Ruck",
  QSource = "QSource",
  Swim = "Swim",
  Other = "Other",
}

enum EventTags {
  Open = "Open",
  VQ = "VQ",
  Manniversary = "Manniversary",
  Convergence = "Convergence",
}

enum EventCategories {
  "1st F - Core Workout" = "1st F - Core Workout",
  "1st F - Pre Workout" = "1st F - Pre Workout",
  "1st F - Off the books" = "1st F - Off the books",
  "2nd F - Fellowship" = "2nd F - Fellowship",
  "3rd F - Faith" = "3rd F - Faith",
}

export async function insertDatabaseStructure(
  _workoutData?: WorkoutSheetData[],
) {
  const orgTypes = await db
    .insert(schema.orgTypes)
    .values([
      { name: OrgTypes.AO },
      { name: OrgTypes.Region },
      { name: OrgTypes.Area },
      { name: OrgTypes.Sector },
    ])
    .returning();

  const eventCategories = await db
    .insert(schema.eventCategories)
    .values([
      {
        name: EventCategories["1st F - Core Workout"],
        description: "The core F3 activity - must meet all 5 core principles.",
      },
      {
        name: EventCategories["1st F - Pre Workout"],
        description: "Pre-workout activities (pre-rucks, pre-runs, etc).",
      },
      {
        name: EventCategories["1st F - Off the books"],
        description:
          "Fitness activities that didn't meet all 5 core principles (unscheduled, open to all men, etc).",
      },
      {
        name: EventCategories["2nd F - Fellowship"],
        description: "General category for 2nd F events.",
      },
      {
        name: EventCategories["3rd F - Faith"],
        description: "General category for 3rd F events.",
      },
    ])
    .returning();

  const eventTypes = await db
    .insert(schema.eventTypes)
    .values([
      {
        name: EventTypes.Bootcamp,
        acronym: "BC",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Core Workout"].toString(),
          )?.id ?? -1,
      },
      {
        name: EventTypes.Run,
        acronym: "RU",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Core Workout"].toString(),
          )?.id ?? -1,
      },
      {
        name: EventTypes.Ruck,
        acronym: "RK",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Core Workout"].toString(),
          )?.id ?? -1,
      },
      {
        name: EventTypes.QSource,
        acronym: "QS",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Off the books"].toString(),
          )?.id ?? -1,
      },
      {
        name: EventTypes.Swim,
        acronym: "SW",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Core Workout"].toString(),
          )?.id ?? -1,
      },
      {
        name: EventTypes.Other,
        acronym: "OT",
        categoryId:
          eventCategories.find(
            (ec) =>
              ec.name === EventCategories["1st F - Core Workout"].toString(),
          )?.id ?? -1,
      },
    ])
    .returning();

  const eventTags = await db
    .insert(schema.eventTags)
    .values([
      { name: EventTags.Open, color: "Green" },
      { name: EventTags.VQ, color: "Blue" },
      { name: EventTags.Manniversary, color: "Yellow" },
      { name: EventTags.Convergence, color: "Orange" },
    ])
    .returning();

  return { orgTypes, eventTypes, eventTags, eventCategories };
}

export async function insertData(data: {
  workoutData: WorkoutSheetData[];
  regionData: RegionSheetData[];
}) {
  const orgTypes = await db.select().from(schema.orgTypes);
  const eventTypes = await db.select().from(schema.eventTypes);

  const { workoutData, regionData } = data;

  const regions = await db
    .insert(schema.orgs)
    .values(
      regionData.map((region) => {
        const regionData: InferInsertModel<typeof schema.orgs> = {
          name: region["Region Name"] ?? "",
          isActive: true,
          orgTypeId:
            orgTypes.find((ot) => ot.name === OrgTypes.Region.toString())?.id ??
            -1, // shouldn't ever happen
          website: region.Website,
          email: region["Region Email"],
          description: undefined, // NOTE: currently no region descriptions
          logo: undefined, // NOTE: currently no region logos
          parentId: undefined, // NOTE: maybe this should be a sector?
        };
        return regionData;
      }),
    )
    .onConflictDoNothing()
    .returning({ id: schema.orgTypes.id, name: schema.orgTypes.name });

  console.log("inserted regions", regions.length, regions[0]);

  const uniqueAOsWithWorkouts = workoutData.reduce(
    (acc, workout) => {
      const workoutRegionId = regions.find(
        (region) => region.name === workout.Region,
      )?.id;
      const latLonKey = getLatLonKey({
        latitude: workout.Latitude,
        longitude: workout.Longitude,
      });
      if (workoutRegionId === undefined || latLonKey === undefined) return acc;
      if (!acc[latLonKey]) {
        acc[latLonKey] = {
          ao: {
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
    {} as Record<
      string,
      {
        ao: {
          regionId: number;
          latitude: string | undefined;
          longitude: string | undefined;
          key: string;
        };
        events: WorkoutSheetData[];
      }
    >,
  );

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
    .returning();

  console.log("inserted ao orgs", aoOrgs.length, aoOrgs[0]);

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

  const aoLocs = await db
    .insert(schema.locations)
    .values(
      Object.values(uniqueAOsWithWorkouts).map(({ ao, events }) => {
        const aoOrg = aoOrgKeyDict[ao.key];
        const aoData: InferInsertModel<typeof schema.locations> = {
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
    .returning();

  console.log("inserted aos", aoLocs.length, aoLocs[0]);

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
  console.log("events to insert:", eventsToInsert.length, eventsToInsert[0]);

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
