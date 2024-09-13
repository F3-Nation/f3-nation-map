import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { GroupedMapData, LeafletWorkoutData } from "@f3/shared/app/types";
import { env } from "@f3/env";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { groupMarkersByLocation } from "@f3/shared/app/functions";
import { onlyUnique } from "@f3/shared/common/functions";

import { db, eq, schema } from ".";
import { getLocationData } from "./utils/get-location-data";

dayjs.extend(customParseFormat);

if (!("DATABASE_URL" in env))
  throw new Error("DATABASE_URL not found on .env.development");

const _reseedFromScratch = async () => {
  const mapData = await getLocationData();
  const organizedMapData = groupMarkersByLocation(mapData);
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

  await insertDatabaseStructure(mapData);

  SEED_LOGS && console.log("Inserting data");
  await insertMapData(organizedMapData);

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

export async function insertDatabaseStructure(mapData: LeafletWorkoutData[]) {
  const ORG_TYPES = ["Region"];
  const EVENT_CATEGORIES = mapData
    .map((location) => location.Type)
    .filter(onlyUnique);
  const EVENT_TYPES = EVENT_CATEGORIES;
  await db.insert(schema.orgTypes).values(ORG_TYPES.map((name) => ({ name })));

  const insertedCategories = await db
    .insert(schema.eventCategories)
    .values(EVENT_CATEGORIES.map((name) => ({ name })))
    .returning();

  await db.insert(schema.eventTypes).values(
    EVENT_TYPES.map((name) => ({
      name,
      categoryId:
        insertedCategories.find((category) => category.name === name)?.id ?? 0,
    })),
  );
}

export async function insertMapData(organizedMapData: GroupedMapData[]) {
  const [region] = await db
    .select({ id: schema.orgTypes.id, name: schema.orgTypes.name })
    .from(schema.orgTypes)
    .where(eq(schema.orgTypes.name, "Region"));

  const eventTypes = await db
    .select({ id: schema.eventTypes.id, name: schema.eventTypes.name })
    .from(schema.eventTypes);

  const orgList = await db
    .insert(schema.orgs)
    .values(
      organizedMapData.map((locationData) => ({
        name: locationData.Region.slice(0, 100),
        orgTypeId: region?.id ?? 0,
        logo: locationData.Image,
        website: locationData.Website,
        isActive: true,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: schema.orgs.id, name: schema.orgs.name });

  console.log("Inserted orgs", orgList.length);

  const orgNameDict: Record<string, number> = orgList.reduce(
    (acc, org) => ({ ...acc, [org.name]: org.id }),
    {},
  );

  const locationList = await db
    .insert(schema.locations)
    .values(
      organizedMapData.map((locationData) => ({
        name: locationData.Location,
        description: locationData.Location,
        lat: Math.round(locationData.Latitude * 1e7) / 1e7,
        lon: Math.round(locationData.Longitude * 1e7) / 1e7,
        isActive: true,
        orgId: orgNameDict[locationData.Region.slice(0, 100)],
      })),
    )
    .onConflictDoNothing()
    .returning({ id: schema.locations.id, name: schema.locations.name });

  console.log("Inserted locations", locationList.length);

  const locationIdDict: Record<string, number> = locationList.reduce(
    (acc, location) => ({ ...acc, [location.name]: location.id }),
    {},
  );

  const insertEvents = organizedMapData.flatMap((locationData) =>
    locationData.Groups.map((group) => {
      const dayOfWeek = DAY_ORDER.indexOf(group["Day of week"]);

      const [startTimeRaw, endTimeRaw] = group.Time.split("-").map((time) =>
        time.trim(),
      );
      // .format("HH:mm:ss")
      const startTime = startTimeRaw
        ? dayjs(startTimeRaw.toLowerCase(), "hh:mm a")
        : undefined;
      const endTime = endTimeRaw
        ? dayjs(endTimeRaw.toLowerCase(), "hh:mm a")
        : undefined;
      return {
        locationId: locationIdDict[locationData.Location],
        isActive: true,
        isSeries: true,
        highlight: false,
        startDate: dayjs().format("YYYY-MM-DD"), // You might want to set a specific start date
        dayOfWeek,
        startTime: startTime?.isValid() ? startTime.format("h:mm a") : null,
        endTime: endTime?.isValid() ? endTime.format("h:mm a") : null,
        name: group.WorkoutName.slice(0, 100),
        eventTypeId: eventTypes.find((et) => et.name === group.Type)?.id, // Bootcamp
        description: group.Notes,
        recurrencePattern: "weekly",
      };
    }),
  );

  console.log("Inserting events", insertEvents.length);

  const events = await db
    .insert(schema.events)
    .values(insertEvents)
    .onConflictDoNothing()
    .returning({ id: schema.events.id });

  console.log("Inserted events", events.length);
}
