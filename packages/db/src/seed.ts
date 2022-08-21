import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { InferInsertModel } from "@f3/db";
import { env } from "@f3/env";
import { DAY_ORDER } from "@f3/shared/app/constants";
import { groupMarkersByLocation } from "@f3/shared/app/functions";
import { mapData } from "@f3/shared/app/mock";
import { onlyUnique } from "@f3/shared/common/functions";

import { db, eq, schema } from ".";

dayjs.extend(customParseFormat);

if (!("DATABASE_URL" in env))
  throw new Error("DATABASE_URL not found on .env.development");

export const organizedMapData = groupMarkersByLocation(mapData);

const _reseedFromScratch = async () => {
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

  await insertDatabaseStructure();

  SEED_LOGS && console.log("Inserting data");
  await insertMapData();

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

const { locations, events, orgs } = schema;

const ORG_TYPES = ["Region"];
const EVENT_CATEGORIES = mapData
  .map((location) => location.Type)
  .filter(onlyUnique);
const EVENT_TYPES = EVENT_CATEGORIES;

export async function insertDatabaseStructure() {
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

type InsertOrg = InferInsertModel<typeof orgs>;
type InsertLocation = InferInsertModel<typeof locations>;
type InsertEvent = InferInsertModel<typeof events>;

export async function insertMapData() {
  const [region] = await db
    .select({ id: schema.orgTypes.id, name: schema.orgTypes.name })
    .from(schema.orgTypes)
    .where(eq(schema.orgTypes.name, "Region"));

  const eventTypes = await db
    .select({ id: schema.eventTypes.id, name: schema.eventTypes.name })
    .from(schema.eventTypes);

  for (const locationData of organizedMapData) {
    const insertOrg: InsertOrg = {
      name: locationData.Region.slice(0, 100),
      orgTypeId: region?.id ?? 0,
      logo: locationData.Image,
      website: locationData.Website,
      isActive: true,
    };
    SEED_LOGS && console.log("Inserting org", insertOrg);
    const [insertedOrg] = await db
      .insert(schema.orgs)
      .values(insertOrg)
      .onConflictDoUpdate({
        target: [schema.orgs.id],
        set: insertOrg,
      })
      .returning();

    const insertLocation: InsertLocation = {
      name: locationData.Location,
      description: locationData.Location,
      lat: Math.round(locationData.Latitude * 1e7) / 1e7,
      lon: Math.round(locationData.Longitude * 1e7) / 1e7,
      isActive: true,
      orgId: insertedOrg?.id ?? 0,
    };
    // Insert or update location
    // SEED_LOGS && console.log("Inserting location", insertLocation.name);
    SEED_LOGS && console.log("Inserting locaiton", insertLocation.name);
    const locationResult = await db
      .insert(locations)
      .values(insertLocation)
      .returning({ insertedId: locations.id });

    const locationId = locationResult[0]?.insertedId;

    // Insert events for each group
    for (const group of locationData.Groups) {
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
      const insertEvent: InsertEvent = {
        locationId: locationId,
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
        meta: {
          markerIcon: group["Marker Icon"],
          markerColor: group["Marker Color"],
          iconColor: group["Icon Color"],
          customSize: group["Custom Size"],
        },
      };

      SEED_LOGS && console.log("Inserting event", insertEvent.name);
      await db.insert(events).values(insertEvent);
    }
  }
}
