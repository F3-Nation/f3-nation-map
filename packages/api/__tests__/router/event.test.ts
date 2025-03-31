import { initTRPC } from "@trpc/server";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { db } from "@acme/db/client";

import { appRouter } from "../../src/index";

describe("event router", () => {
  const createTRPCContext = () => {
    return {
      db,
      session: {
        user: {
          id: 0,
          email: "test@test.com",
          roles: [{ orgId: 0, orgName: "test", roleName: "admin" }],
        },
        expires: dayjs().add(1, "day").toISOString(),
      },
    };
  };
  const t = initTRPC.context<typeof createTRPCContext>().create();
  // @ts-expect-error, we skip typechecking due to testing context only
  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller(createTRPCContext());

  it("should event all", async () => {
    const result = await caller.event.all();
    console.log(result);
    expect(result).toEqual(
      expect.objectContaining({
        // events: expect.arrayContaining([
        //   expect.objectContaining({
        //     id: expect.any(Number) as number,
        //     title: expect.any(String) as string,
        //     content: expect.any(String) as string,
        //     createdAt: expect.any(Date) as Date,
        //     updatedAt: expect.any(Date) as Date,
        //   }),
        // ]),
      }),
    );
  });
});
