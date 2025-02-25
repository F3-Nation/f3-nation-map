import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { eq } from "@f3/db";
import { env } from "@f3/env";
import { PERMISSIONS } from "@f3/shared/app/constants";
import {
  DayOfWeek,
  EventTags,
  EventTypes,
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

const GRAVITY_FORMS_TIME_FORMAT = "hh:mm a" as const;
dayjs.extend(customParseFormat);

if (!("DATABASE_URL" in env))
  throw new Error("DATABASE_URL not found on .env.development");

const _reseedUsers = async () => {
  await db.delete(schema.authAccounts);
  await db.delete(schema.authSessions);
  await db.delete(schema.authVerificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.updateRequests);
  await insertUsers();
};

const _reseedFromScratch = async () => {
  const { regionData, workoutData } = await getLocationDataFromGravityForms();
  SEED_LOGS && console.log("Seed start", env.DATABASE_URL);

  await db.delete(schema.attendance);
  await db.delete(schema.attendanceTypes);
  await db.delete(schema.eventTags);
  await db.delete(schema.eventTypes);
  await db.delete(schema.eventsXEventTypes);
  await db.delete(schema.locations);
  await db.delete(schema.orgs);
  await db.delete(schema.permissions);
  await db.delete(schema.roles);
  await db.delete(schema.rolesXPermissions);
  await db.delete(schema.events);
  await db.delete(schema.slackUsers);

  await db.delete(schema.authAccounts);
  await db.delete(schema.authSessions);
  await db.delete(schema.authVerificationTokens);
  await db.delete(schema.users);
  await db.delete(schema.updateRequests);

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
      emailVerified: dayjs().format(),
    },
    {
      email: "patrick@pstaylor.net",
      f3Name: "Baguette",
      firstName: "Patrick",
      lastName: "Taylor",
      emailVerified: dayjs().format(),
    },
    {
      email: "jimsheldon@icloud.com",
      f3Name: "Sumo",
      firstName: "Jim",
      lastName: "Sheldon",
      emailVerified: dayjs().format(),
    },
    {
      email: "damon.vinciguerra@gmail.com",
      f3Name: "Tackle",
      firstName: "Damon",
      lastName: "Vinciguerra",
      emailVerified: dayjs().format(),
    },
    {
      email: "taylor.matt777@gmail.com",
      f3Name: "Backslash",
      firstName: "Matt",
      lastName: "Taylor",
      emailVerified: dayjs().format(),
    },
    {
      email: "pjarchambeault@gmail.com",
      f3Name: "DOS",
      firstName: "PJ",
      lastName: "Archambeault",
      emailVerified: dayjs().format(),
    },
    {
      email: "johnanthonyreynolds@gmail.com",
      f3Name: "Snooki",
      firstName: "John",
      lastName: "Reynolds",
      emailVerified: dayjs().format(),
    },
    {
      email: "evan.petzoldt@protonmail.com",
      f3Name: "Moneyball",
      firstName: "Evan",
      lastName: "Petzoldt",
      emailVerified: dayjs().format(),
    },
  ];

  const users = await db.insert(schema.users).values(usersToInsert).returning();

  const _permissions = await db
    .insert(schema.permissions)
    .values(
      Object.values(PERMISSIONS).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
    )
    .returning();

  const roles = await db
    .insert(schema.roles)
    .values(RegionRole.map((r) => ({ name: r })))
    .returning();

  const editorRegionRole = roles.find((r) => r.name === "editor");
  if (!editorRegionRole) throw new Error("Editor region role not found");

  const regions = await db
    .select()
    .from(schema.orgs)
    .where(eq(schema.orgs.orgType, "region"));

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
  const eventTypes = await db
    .insert(schema.eventTypes)
    .values([
      {
        id: 1,
        name: EventTypes.Bootcamp,
        acronym: "BC",
        eventCategory: "first_f",
      },
      {
        id: 2,
        name: EventTypes.Run,
        acronym: "RU",
        eventCategory: "first_f",
      },
      {
        id: 3,
        name: EventTypes.Ruck,
        acronym: "RK",
        eventCategory: "first_f",
      },
      {
        id: 4,
        name: EventTypes.QSource,
        acronym: "QS",
        eventCategory: "third_f",
      },
      {
        id: 5,
        name: EventTypes.Swimming,
        acronym: "SW",
        eventCategory: "first_f",
      },

      {
        id: 6,
        name: EventTypes.Mobility,
        acronym: "MB",
        eventCategory: "first_f",
      },
      {
        id: 7,
        name: EventTypes.Bike,
        acronym: "BK",
        eventCategory: "first_f",
      },

      {
        id: 8,
        name: EventTypes.Gear,
        acronym: "GR",
        eventCategory: "first_f",
      },
      {
        id: 9,
        name: EventTypes["Wild Card"],
        acronym: "WC",
        eventCategory: "first_f",
      },
      {
        id: 10,
        name: EventTypes.Sports,
        acronym: "SP",
        eventCategory: "first_f",
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

  return { eventTypes, eventTags };
}

export async function insertData(data: {
  workoutData: WorkoutSheetData[];
  regionData: RegionSheetData[];
}) {
  const { eventTypes } = await insertDatabaseStructure(data.workoutData);
  const insertedNation = await db
    .insert(schema.orgs)
    .values({
      name: "F3 Nation",
      isActive: true,
      orgType: "nation",
    })
    .returning({ id: schema.orgs.id });

  const { workoutData, regionData } = data;
  const sectorsToInsert = regionData
    .map((d) => d.Sector || null)
    .filter(isTruthy)
    .filter(onlyUnique);

  const insertedSectors = await db
    .insert(schema.orgs)
    .values(
      sectorsToInsert.map((d) => ({
        name: d,
        isActive: true,
        orgType: "sector" as const,
        parentId: insertedNation[0]?.id,
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

  const insertedAreas = await db
    .insert(schema.orgs)
    .values(
      areasToInsert.map((d) => ({
        name: d.name,
        isActive: true,
        orgType: "area" as const,
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
            orgType: "region" as const,
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
    .returning({ id: schema.orgs.id, name: schema.orgs.name });

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
          orgType: "ao" as const,
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
          created: dayjs(created).format(),
          updated: dayjs(updated).format(),
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
        const dayOfWeek = DayOfWeek.includes(
          workout.Weekday.toLowerCase() as DayOfWeek,
        )
          ? (workout.Weekday.toLowerCase() as DayOfWeek)
          : null;
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
        const startTime = startTimeRaw
          ? dayjs(startTimeRaw.toLowerCase(), GRAVITY_FORMS_TIME_FORMAT)
          : undefined;
        const endTime = endTimeRaw
          ? dayjs(endTimeRaw.toLowerCase(), GRAVITY_FORMS_TIME_FORMAT)
          : undefined;

        const eventTypeId = eventTypes.find((et) => {
          const eventType = getCleanedEventType(workout.Type);
          return et.name === eventType;
        })?.id;
        if (eventTypeId === undefined)
          throw new Error(
            `Event type id is undefined for event ${workout.Type}, ${getCleanedEventType(workout.Type)}`,
          );
        const workoutItem: InferInsertModel<typeof schema.events> = {
          locationId: workoutAoLoc?.id, // locationIdDict[workout.Location],
          isActive: true,
          isSeries: true,
          highlight: false,
          startDate: dayjs().format("YYYY-MM-DD"), // You might want to set a specific start date
          dayOfWeek,
          startTime: startTime?.isValid() ? startTime.format("HHmm") : null,
          endTime: endTime?.isValid() ? endTime.format("HHmm") : null,
          name: workout["Workout Name"].slice(0, 100),
          meta: { eventTypeId },
          description: workout.Note,
          recurrencePattern: "weekly",
          orgId,
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

  await db
    .insert(schema.eventsXEventTypes)
    .values(
      insertedEvents.map((e) => {
        return {
          eventId: e.id,
          eventTypeId: e.meta?.eventTypeId as number,
        };
      }),
    )
    .returning();
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

const getCleanedEventType = (eventTypeRaw: string) => {
  if (eventTypeRaw === "Cycling") return "Bike";
  if (
    eventTypeRaw === "Strength/Conditioning/Tabata/WIB" ||
    eventTypeRaw === "CORE"
  )
    return "Bootcamp";
  if (eventTypeRaw === "Obstacle Training" || eventTypeRaw === "Sandbag")
    return "Gear";
  if (eventTypeRaw === "Mobility/Stretch") return "Mobility";
  if (
    eventTypeRaw === "Run with Pain Stations" ||
    eventTypeRaw === "Speed/Strength Running"
  )
    return "Run";
  return eventTypeRaw;
};
