import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { eq } from "@f3/db";
import { env } from "@f3/env";
import { DAY_ORDER } from "@f3/shared/app/constants";
import {
  EventCategories,
  EventTags,
  EventTypes,
  OrgTypes,
  RegionRole,
} from "@f3/shared/app/enums";
import {
  isTruthy,
  onlyUnique,
  safeParseFloat,
} from "@f3/shared/common/functions";

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

const _reseedUsers = async () => {
  await db.delete(schema.nextAuthAccounts);
  await db.delete(schema.nextAuthSessions);
  await db.delete(schema.nextAuthVerificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.updateRequests);
  await insertUsers();
};

const _reseedFromScratch = async () => {
  const { regionData, workoutData } = await getLocationDataFromGravityForms();
  SEED_LOGS && console.log("Seed start", env.DATABASE_URL);

  await db.delete(schema.attendance);
  await db.delete(schema.attendanceTypes);
  await db.delete(schema.eventCategories);
  await db.delete(schema.eventTags);
  await db.delete(schema.eventTypes);
  await db.delete(schema.eventsXEventTypes);
  await db.delete(schema.locations);
  await db.delete(schema.orgTypes);
  await db.delete(schema.orgs);
  await db.delete(schema.events);
  await db.delete(schema.slackUsers);

  await db.delete(schema.nextAuthAccounts);
  await db.delete(schema.nextAuthSessions);
  await db.delete(schema.nextAuthVerificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.updateRequests);

  await insertDatabaseStructure(workoutData);

  SEED_LOGS && console.log("Inserting data");
  await insertData({ regionData, workoutData });

  await insertUsers();

  SEED_LOGS && console.log("Seed done");
};

export const seed = async () => {
  await _reseedFromScratch();
  // await _reseedUsers();
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

export async function insertUsers() {
  const usersToInsert: InferInsertModel<typeof schema.users>[] = [
    {
      email: "declan@mountaindev.com",
      f3Name: "Spuds",
      firstName: "Declan",
      lastName: "Nishiyama",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "patrick@pstaylor.net",
      f3Name: "Baguette",
      firstName: "Patrick",
      lastName: "Taylor",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "jimsheldon@icloud.com",
      f3Name: "Sumo",
      firstName: "Jim",
      lastName: "Sheldon",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "damon.vinciguerra@gmail.com",
      f3Name: "Tackle",
      firstName: "Damon",
      lastName: "Vinciguerra",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "taylor.matt777@gmail.com",
      f3Name: "Backslash",
      firstName: "Matt",
      lastName: "Taylor",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "pjarchambeault@gmail.com",
      f3Name: "DOS",
      firstName: "PJ",
      lastName: "Archambeault",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "johnanthonyreynolds@gmail.com",
      f3Name: "Snooki",
      firstName: "John",
      lastName: "Reynolds",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
    {
      email: "evan.petzoldt@protonmail.com",
      f3Name: "Moneyball",
      firstName: "Evan",
      lastName: "Petzoldt",
      role: "admin",
      emailVerified: dayjs().toDate(),
    },
  ];

  const users = await db.insert(schema.users).values(usersToInsert).returning();

  const roles = await db
    .insert(schema.roles)
    .values(RegionRole.map((r) => ({ name: r })))
    .returning();

  const editorRegionRole = roles.find((r) => r.name === "editor");
  if (!editorRegionRole) throw new Error("Editor region role not found");

  const orgTypes = await db.select().from(schema.orgTypes);

  const regionOrgType = orgTypes.find(
    (ot) => ot.name === OrgTypes.Region.toString(),
  )?.id;
  if (!regionOrgType) throw new Error("Region org type not found");

  const regions = await db
    .select()
    .from(schema.orgs)
    .where(eq(schema.orgs.orgTypeId, regionOrgType));

  const rolesXUsersXOrg: InferInsertModel<typeof schema.rolesXUsersXOrg>[] = [
    {
      userId: users.find((u) => u.email === "declan@mountaindev.com")?.id ?? -1,
      roleId: editorRegionRole.id,
      orgId: regions.find((r) => r.name === "Boone")?.id ?? -1,
    },
    {
      userId: users.find((u) => u.email === "patrick@pstaylor.net")?.id ?? -1,
      roleId: editorRegionRole.id,
      orgId: regions.find((r) => r.name === "Boone")?.id ?? -1,
    },
    {
      userId: users.find((u) => u.email === "jimsheldon@icloud.com")?.id ?? -1,
      roleId: editorRegionRole.id,
      orgId: regions.find((r) => r.name === "Boone")?.id ?? -1,
    },
  ];

  await db.insert(schema.rolesXUsersXOrg).values(rolesXUsersXOrg);
}

export async function insertDatabaseStructure(
  _workoutData?: WorkoutSheetData[],
) {
  const orgTypes = await db
    .insert(schema.orgTypes)
    .values([
      { name: OrgTypes.AO, id: 1 },
      { name: OrgTypes.Region, id: 2 },
      { name: OrgTypes.Area, id: 3 },
      { name: OrgTypes.Sector, id: 4 },
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

  const coreWorkoutEventCategoryId = eventCategories.find(
    (ec) => ec.name === EventCategories["1st F - Core Workout"].toString(),
  )?.id;
  if (!coreWorkoutEventCategoryId)
    throw new Error("Core workout event category not found");

  const offTheBooksEventCategoryId = eventCategories.find(
    (ec) => ec.name === EventCategories["1st F - Off the books"].toString(),
  )?.id;
  if (!offTheBooksEventCategoryId)
    throw new Error("Off the books event category not found");

  const faithEventCategoryId = eventCategories.find(
    (ec) => ec.name === EventCategories["3rd F - Faith"].toString(),
  )?.id;
  if (!faithEventCategoryId) throw new Error("Faith event category not found");

  const fellowshipEventCategoryId = eventCategories.find(
    (ec) => ec.name === EventCategories["2nd F - Fellowship"].toString(),
  )?.id;
  if (!fellowshipEventCategoryId)
    throw new Error("Fellowship event category not found");

  const eventTypes = await db
    .insert(schema.eventTypes)
    .values([
      {
        id: 1,
        name: EventTypes.Bootcamp,
        acronym: "BC",
        categoryId: coreWorkoutEventCategoryId,
      },
      {
        id: 2,
        name: EventTypes.Run,
        acronym: "RU",
        categoryId: coreWorkoutEventCategoryId,
      },
      {
        id: 3,
        name: EventTypes.Ruck,
        acronym: "RK",
        categoryId: coreWorkoutEventCategoryId,
      },
      {
        id: 4,
        name: EventTypes.QSource,
        acronym: "QS",
        categoryId: faithEventCategoryId,
      },
      {
        id: 5,
        name: EventTypes.Swimming,
        acronym: "SW",
        categoryId: coreWorkoutEventCategoryId,
      },

      {
        id: 6,
        name: EventTypes.Mobility,
        acronym: "MB",
        categoryId: coreWorkoutEventCategoryId,
      },
      {
        id: 7,
        name: EventTypes.Bike,
        acronym: "BK",
        categoryId: coreWorkoutEventCategoryId,
      },

      {
        id: 8,
        name: EventTypes.Gear,
        acronym: "GR",
        categoryId: coreWorkoutEventCategoryId,
      },
      {
        id: 9,
        name: EventTypes["Wild Card"],
        acronym: "WC",
        categoryId: offTheBooksEventCategoryId,
      },
      {
        id: 10,
        name: EventTypes["2ndF"],
        acronym: "2F",
        categoryId: fellowshipEventCategoryId,
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
  const sectorsToInsert = regionData
    .map((d) => d.Sector || null)
    .filter(isTruthy)
    .filter(onlyUnique);
  const sectorOrgType = orgTypes.find(
    (ot) => ot.name === OrgTypes.Sector.toString(),
  )?.id;
  if (!sectorOrgType) throw new Error("Sector org type not found");

  const insertedSectors = await db
    .insert(schema.orgs)
    .values(
      sectorsToInsert.map((d) => ({
        name: d,
        isActive: true,
        orgTypeId: sectorOrgType,
      })),
    )
    .returning();
  const sectorNameToId = insertedSectors.reduce(
    (acc, d) => {
      acc[d.name] = d.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const areasToInsert = regionData
    .map((d) => {
      const sectorId = sectorNameToId[d.Sector];
      if (sectorId === undefined || !d.Area) return null;
      return { name: d.Area, sectorId };
    })
    .filter(isTruthy)
    .filter(
      (d, idx, arr) =>
        d.name !== "" &&
        d.sectorId !== undefined &&
        arr.findIndex((d2) => d2.name === d.name) === idx,
    );

  const areaOrgType = orgTypes.find(
    (ot) => ot.name === OrgTypes.Area.toString(),
  )?.id;
  if (!areaOrgType) throw new Error("Area org type not found");
  const insertedAreas = await db
    .insert(schema.orgs)
    .values(
      areasToInsert.map((d) => ({
        name: d.name,
        isActive: true,
        orgTypeId: areaOrgType,
        parentId: d.sectorId,
      })),
    )
    .returning();

  const areaNameToId = insertedAreas.reduce(
    (acc, d) => {
      acc[d.name] = d.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const regions = await db
    .insert(schema.orgs)
    .values(
      regionData
        .map((region) => {
          if (!region["Region Name"].replace("-", "").trim()) return null;
          const areaId = areaNameToId[region.Area];
          if (areaId === undefined) return null;
          const regionData: InferInsertModel<typeof schema.orgs> = {
            name: region["Region Name"] ?? "",
            isActive: true,
            orgTypeId:
              orgTypes.find((ot) => ot.name === OrgTypes.Region.toString())
                ?.id ?? -1, // shouldn't ever happen
            website:
              region.Website.includes("f3nation.com") ||
              region.Website.includes(".slack.com")
                ? undefined
                : region.Website,
            email: region["Region Email"],
            description: undefined, // NOTE: currently no region descriptions
            parentId: areaId,
            created: dayjs(region.Created).format(),
            updated: dayjs(region.Updated).format(),
          };
          return regionData;
        })
        .filter(isTruthy),
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
        const created = events
          .reduce(
            (acc, e) =>
              dayjs(e.Created).isBefore(acc) ? dayjs(e.Created) : acc,
            dayjs(),
          )
          .format();
        const updated = events
          .reduce(
            (acc, e) =>
              dayjs(e.Updated).isAfter(acc) ? dayjs(e.Updated) : acc,
            dayjs(0),
          )
          .format();

        const aoData: InferInsertModel<typeof schema.orgs> = {
          // name: "", // AOs do not have names yet
          name: events
            .map((e) => e["Workout Name"])
            .filter(onlyUnique)
            .join(", "), // AO locations do not have names yet (should be "Walgreens" etc)
          isActive: true,
          orgTypeId:
            orgTypes.find((ot) => ot.name === OrgTypes.AO.toString())?.id ?? -1,
          logoUrl: events[0]?.Logo,
          parentId: ao.regionId,
          description: undefined,
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
          created,
          updated,
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
        const orgId = aoOrg?.id;
        if (orgId == undefined) throw new Error("AO org id not found");
        const aoData: InferInsertModel<typeof schema.locations> = {
          name: "", // AO locations do not have names yet (should be "Walgreens" etc)
          isActive: true,
          addressStreet: events[0]?.["Address 1"],
          addressStreet2: events[0]?.["Address 2"],
          addressCity: events[0]?.City,
          addressState: events[0]?.State,
          addressZip: events[0]?.["Postal Code"],
          addressCountry: events[0]?.Country,
          description: aoOrg?.description, // AOs description is the address
          latitude: safeParseFloat(ao.latitude),
          longitude: safeParseFloat(ao.longitude),
          orgId,
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
      const aoOrg = aoOrgKeyDict[ao.key];
      const orgId = aoOrg?.id;
      if (orgId == undefined) throw new Error("AO org id not found");
      return events.map((workout) => {
        const dayOfWeek = DAY_ORDER.indexOf(workout.Weekday);
        const workoutAoLoc = aoLocs.find(
          (aoItem) =>
            ao.key ===
            getLatLonKey({
              latitude: aoItem.latitude,
              longitude: aoItem.longitude,
            }),
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
          // eventTypeId: eventTypes.find((et) => et.name === workout.Type)?.id, // Bootcamp
          description: workout.Note,
          recurrencePattern: "weekly",
          orgId,
          meta: {
            eventType: workout.Type,
            eventTypeId: eventTypes.find((et) => et.name === workout.Type)?.id,
          },
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

  const insertedEvents = await db.select().from(schema.events);

  const eventXEventTypesToInsert: InferInsertModel<
    typeof schema.eventsXEventTypes
  >[] = Object.values(insertedEvents)
    .map((event) => {
      const eventTypeId = event.meta?.eventTypeId as number;
      if (!eventTypeId) return null;
      return {
        eventId: event.id,
        eventTypeId,
      };
    })
    .filter(isTruthy);

  for (let i = 0; i < eventXEventTypesToInsert.length; i += chunkSize) {
    const eventXEventTypesChunk = eventXEventTypesToInsert.slice(
      i,
      i + chunkSize,
    );
    await db
      .insert(schema.eventsXEventTypes)
      .values(eventXEventTypesChunk)
      .returning();
    console.log("inserted eventXEventTypes", i + eventXEventTypesChunk.length);
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
