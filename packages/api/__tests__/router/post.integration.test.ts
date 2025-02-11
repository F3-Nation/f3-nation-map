import type { inferProcedureInput } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { getTableName, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db, schema } from "@f3/db";

import type { AppRouter } from "../../src/index";
import { appRouter } from "../../src/index";

describe("post router with db testing", () => {
  const createTRPCContext = () => {
    return {
      db,
      session: {
        user: {
          id: "test-id",
        },
      },
    };
  };
  const t = initTRPC.context<typeof createTRPCContext>().create();
  // @ts-expect-error, we skip typechecking due to testing context only
  const createCaller = t.createCallerFactory(appRouter);
  const ctx = createTRPCContext();
  const caller = createCaller(ctx);

  beforeAll(async () => {
    await ctx.db.execute(
      sql.raw(
        `ALTER SEQUENCE "${getTableName(schema.post)}_id_seq" RESTART WITH 1`,
      ),
    );
  });

  afterAll(async () => {
    await ctx.db.delete(schema.post);
  });

  it("should add a post", async () => {
    const input: inferProcedureInput<AppRouter["post"]["create"]> = {
      title: "hello test",
      content: "hello test",
    };
    const result = await caller.post.create(input);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
  });

  it("should get by id", async () => {
    const input: inferProcedureInput<AppRouter["post"]["byId"]> = {
      id: 1,
    };

    const result = await caller.post.byId(input);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number) as number,
        title: expect.any(String) as string,
        content: expect.any(String) as string,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      }),
    );
  });

  it("should get all items", async () => {
    const result = await caller.post.all();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number) as number,
          title: expect.any(String) as string,
          content: expect.any(String) as string,
          createdAt: expect.any(Date) as Date,
          updatedAt: expect.any(Date) as Date,
        }),
      ]),
    );
  });

  it("should delete", async () => {
    const input: inferProcedureInput<AppRouter["post"]["delete"]> = { id: 1 };
    const result = await caller.post.delete(input);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
  });
});
