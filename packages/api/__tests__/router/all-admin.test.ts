import { initTRPC } from "@trpc/server";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import type { DayOfWeek } from "@acme/shared/app/enums";
import { db } from "@acme/db/client";
import {
  TEST_ADMIN_USER_ID,
  TEST_EDITOR_USER_ID,
  TEST_NATION_ORG_ID,
  TEST_REGION_2_ORG_ID,
  TEST_SECTOR_ORG_ID,
} from "@acme/shared/app/constants";

import { appRouter } from "../../src/index";

interface User {
  id: number;
  email: string;
  roles: { orgId: number; orgName: string; roleName: string }[];
}

const adminUser: User = {
  id: TEST_ADMIN_USER_ID,
  email: "admin@test.com",
  roles: [
    { orgId: TEST_NATION_ORG_ID, orgName: "Test Nation", roleName: "admin" },
  ],
};

describe("all admin routers", () => {
  const createTRPCContext = (user: User) => {
    return {
      db,
      session: {
        user,
        roles: user.roles,
        expires: dayjs().add(1, "day").toISOString(),
      },
    };
  };
  const t = initTRPC.context<typeof createTRPCContext>().create();
  // @ts-expect-error, we skip typechecking due to testing context only
  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller(createTRPCContext(adminUser));

  // Auth Router Tests
  describe("auth router", () => {
    it("should get session", async () => {
      const result = await caller.auth.getSession();
      expect(result).toBeDefined();
    });

    it("should get secret message", async () => {
      const result = await caller.auth.getSecretMessage();
      expect(result).toBe("you can see this secret message!");
    });
  });

  // AO Router Tests
  describe("ao router", () => {
    it("should get all aos", async () => {
      const result = await caller.ao.all();
      expect(result).toBeDefined();
    });

    let createdAoId: number | undefined;
    it("should create and get ao by id", async () => {
      const aoData = {
        name: "Test AO",
        orgType: "ao",
        isActive: true,
        parentId: TEST_REGION_2_ORG_ID,
        email: "test@ao.com",
        description: "Test AO Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testao",
        facebook: "testao",
        instagram: "@testao",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
      };
      const aoResult = await caller.ao.crupdate(aoData);
      expect(aoResult).toBeDefined();
      if (!aoResult) {
        throw new Error("AO result is undefined");
      }
      createdAoId = aoResult.id;
      const result = await caller.ao.byId({ id: aoResult.id });
      expect(result).toBeDefined();
    });

    it("should delete ao", async () => {
      if (!createdAoId) {
        throw new Error("Created AO ID is undefined");
      }
      await caller.ao.delete({ id: createdAoId });
      const result = await caller.ao.byId({ id: createdAoId });
      expect(result?.isActive).toBe(false);
    });
  });

  // Area Router Tests
  describe("area router", () => {
    it("should get all areas", async () => {
      const result = await caller.area.all();
      expect(result).toBeDefined();
    });

    let createdAreaId: number | undefined;
    it("should create and get area by id", async () => {
      const areaData = {
        name: "Test Area",
        orgType: "area",
        isActive: true,
        parentId: TEST_NATION_ORG_ID,
        email: "test@area.com",
        description: "Test Area Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testarea",
        facebook: "testarea",
        instagram: "@testarea",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
      };
      const areaResult = await caller.area.crupdate(areaData);
      expect(areaResult).toBeDefined();
      if (!areaResult) {
        throw new Error("Area result is undefined");
      }
      createdAreaId = areaResult.id;
      const result = await caller.area.byId({ id: areaResult.id });
      expect(result).toBeDefined();
    });

    it("should delete area", async () => {
      if (!createdAreaId) {
        throw new Error("Created area ID is undefined");
      }
      await caller.area.delete({ id: createdAreaId });
      const result = await caller.area.byId({ id: createdAreaId });
      expect(result?.isActive).toBe(false);
    });
  });

  // Event Router Tests
  describe("event router", () => {
    it("should get all events", async () => {
      const result = await caller.event.all();
      expect(result).toBeDefined();
    });

    let eventId: number | undefined;

    it("should create and get event by id", async () => {
      const aoData = {
        name: "Test AO",
        orgType: "ao",
        isActive: true,
        parentId: TEST_REGION_2_ORG_ID,
        email: "test@ao.com",
        description: "Test AO Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testao",
        facebook: "testao",
        instagram: "@testao",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
      };
      const aoResult = await caller.ao.crupdate(aoData);
      expect(aoResult).toBeDefined();

      if (!aoResult) {
        throw new Error("AO result is undefined");
      }

      const locationData = {
        name: "Test Location",
        isActive: true,
        orgId: aoResult.id,
        aoName: "Test AO",
        email: "test@location.com",
        description: "Test Location Description",
      };
      const locationResult = await caller.location.crupdate(locationData);
      expect(locationResult).toBeDefined();
      if (!locationResult) {
        throw new Error("Location result is undefined");
      }

      const eventData = {
        name: "Test Event",
        isActive: true,
        aoId: aoResult.id,
        locationId: locationResult?.id,
        regionId: TEST_REGION_2_ORG_ID,
        isSeries: false,
        highlight: false,
        startDate: dayjs().format("YYYY-MM-DD"),
        startTime: "0600",
        endTime: "0700",
        email: "test@event.com",
        description: "Test Event Description",
        dayOfWeek: "monday" as DayOfWeek,
        qSource: "QSource",
        q: "Q",
        coq: "COQ",
        fng: "FNG",
        backblast: "Backblast",
        backblastTs: dayjs().unix(),
        meta: { key: "value" },
      };
      const eventResult = await caller.event.crupdate(eventData);
      expect(eventResult).toBeDefined();
      if (!eventResult) {
        throw new Error("Event result is undefined");
      }
      eventId = eventResult.id;
    });

    it("should get event types", async () => {
      const result = await caller.event.types();
      expect(result).toBeDefined();
    });

    it("should delete event", async () => {
      if (!eventId) {
        throw new Error("Event ID is undefined");
      }
      await caller.event.delete({ id: eventId });
      const result = await caller.event.byId({ id: eventId });
      expect(result?.isActive).toBe(false);
    });
  });

  // Location Router Tests
  describe("location router", () => {
    it("should get all locations", async () => {
      const result = await caller.location.all();
      expect(result).toBeDefined();
    });

    it("should get location markers sparse", async () => {
      const result = await caller.location.getLocationMarkersSparse();
      expect(result).toBeDefined();
    });

    it("should get preview locations", async () => {
      const result = await caller.location.getPreviewLocations();
      expect(result).toBeDefined();
    });

    it("should get regions with location", async () => {
      const result = await caller.location.getRegionsWithLocation();
      expect(result).toBeDefined();
    });

    it("should get workout count", async () => {
      const result = await caller.location.getWorkoutCount();
      expect(result).toBeDefined();
    });

    it("should create and get location by id", async () => {
      const locationData = {
        name: "Test Location",
        isActive: true,
        orgId: TEST_REGION_2_ORG_ID,
        aoName: "Test AO",
        email: "test@location.com",
        description: "Test Location Description",
        latitude: 40.7128,
        longitude: -74.006,
        addressStreet: "123 Test St",
        addressStreet2: "Apt 4B",
        addressCity: "Test City",
        addressState: "TS",
        addressZip: "12345",
        addressCountry: "Test Country",
        meta: { key: "value" },
      };
      const locationResult = await caller.location.crupdate(locationData);
      expect(locationResult).toBeDefined();
      if (!locationResult) {
        throw new Error("Location result is undefined");
      }
      const result = await caller.location.byId({ id: locationResult.id });
      expect(result).toBeDefined();
    });
  });

  // Nation Router Tests
  describe("nation router", () => {
    it("should get all nations", async () => {
      const result = await caller.nation.all();
      expect(result).toBeDefined();
    });

    it("should get all orgs", async () => {
      const result = await caller.nation.allOrgs();
      expect(result).toBeDefined();
    });

    const randomNumber = Math.floor(Math.random() * 1000000);
    const name = `Test Nation ${randomNumber}`;
    it("should update and get nation by id", async () => {
      const nationData = {
        id: TEST_NATION_ORG_ID,
        name,
        orgType: "nation",
        isActive: true,
        email: "test@nation.com",
        description: "Test Nation Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testnation",
        facebook: "testnation",
        instagram: "@testnation",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
      };
      const result = await caller.nation.crupdate(nationData);
      expect(result).toBeDefined();
      if (!result) {
        throw new Error("Nation result is undefined");
      }
      const result2 = await caller.nation.byId({ id: result.id });
      expect(result2).toBeDefined();
      expect(result2?.name).toBe(name);
    });

    it("should delete nation", async () => {
      await caller.nation.delete({ id: TEST_NATION_ORG_ID });
      const result = await caller.nation.byId({ id: TEST_NATION_ORG_ID });
      expect(result?.isActive).toBe(false);
    });
  });

  // Ping Router Tests
  describe("ping router", () => {
    it("should ping", async () => {
      const result = await caller.ping();
      expect(result).toBeDefined();
    });
  });

  // Region Router Tests
  describe("region router", () => {
    it("should get all regions", async () => {
      const result = await caller.region.all();
      expect(result).toBeDefined();
    });

    let createdRegionId: number | undefined;
    it("should create and get region by id", async () => {
      const regionData = {
        name: "Test Region",
        orgType: "region",
        isActive: true,
        parentId: TEST_SECTOR_ORG_ID,
        email: "test@region.com",
        description: "Test Region Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testregion",
        facebook: "testregion",
        instagram: "@testregion",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
      };
      const regionResult = await caller.region.crupdate(regionData);
      expect(regionResult).toBeDefined();
      if (!regionResult) {
        throw new Error("Region result is undefined");
      }
      createdRegionId = regionResult.id;
      const result = await caller.region.byId({ id: regionResult.id });
      expect(result).toBeDefined();
    });

    it("should delete region", async () => {
      if (!createdRegionId) {
        throw new Error("Created region ID is undefined");
      }
      await caller.region.delete({ id: createdRegionId });
      const result = await caller.region.byId({ id: createdRegionId });
      expect(result?.isActive).toBe(false);
    });
  });

  // Request Router Tests
  describe("request router", () => {
    it("should get all requests", async () => {
      const result = await caller.request.all();
      expect(result).toBeDefined();
    });

    it("should check can edit region", async () => {
      const result = await caller.request.canEditRegion({
        orgId: TEST_NATION_ORG_ID,
      });
      expect(result).toBeDefined();
    });
  });

  // Sector Router Tests
  describe("sector router", () => {
    let createdSectorId: number | undefined;

    it("should create and get sector by id", async () => {
      const sectorData = {
        name: "Test Sector",
        orgType: "sector",
        isActive: true,
        email: "test@sector.com",
        description: "Test Sector Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testsector",
        facebook: "testsector",
        instagram: "@testsector",
        parentId: TEST_NATION_ORG_ID,
      };
      const sectorResult = await caller.sector.crupdate(sectorData);
      expect(sectorResult).toBeDefined();
      if (!sectorResult) {
        throw new Error("Sector result is undefined");
      }
      createdSectorId = sectorResult.id;
      const result = await caller.sector.byId({ id: sectorResult.id });
      expect(result).toBeDefined();
    });

    it("should update and get sector by id", async () => {
      const sectorData = {
        id: TEST_SECTOR_ORG_ID,
        name: "Test Sector",
        orgType: "sector",
        isActive: true,
        email: "test@sector.com",
        description: "Test Sector Description",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        twitter: "@testsector",
        facebook: "testsector",
        instagram: "@testsector",
        lastAnnualReview: dayjs().toISOString(),
        meta: { key: "value" },
        parentId: TEST_NATION_ORG_ID,
      };
      const sectorResult = await caller.sector.crupdate(sectorData);
      expect(sectorResult).toBeDefined();
      if (!sectorResult) {
        throw new Error("Sector result is undefined");
      }
      createdSectorId = sectorResult.id;
      const result = await caller.sector.byId({ id: sectorResult.id });
      expect(result).toBeDefined();
    });

    it("should delete sector", async () => {
      if (!createdSectorId) {
        throw new Error("Created sector ID is undefined");
      }
      await caller.sector.delete({ id: createdSectorId });
      const result = await caller.sector.byId({ id: createdSectorId });
      expect(result?.isActive).toBe(false);
    });

    it("should get all sectors", async () => {
      const result = await caller.sector.all();
      expect(result).toBeDefined();
      // Verify deleted sector is not included
      expect(
        result.find((sector) => sector.id === createdSectorId),
      ).toBeUndefined();
    });
  });

  // User Router Tests
  describe("user router", () => {
    it("should get all users", async () => {
      const result = await caller.user.all();
      expect(result).toBeDefined();
    });

    it("should get user by id", async () => {
      const result = await caller.user.byId({ id: TEST_ADMIN_USER_ID });
      expect(result).toBeDefined();

      const result2 = await caller.user.byId({ id: TEST_EDITOR_USER_ID });
      expect(result2).toBeDefined();
    });
  });
});
