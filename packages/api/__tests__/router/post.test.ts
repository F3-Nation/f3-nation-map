import { initTRPC } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";

import { appRouter } from "../../src/index";

describe("post router", () => {
  const createTRPCContext = () => {
    return {
      db: {
        query: {
          post: {
            findMany: vi.fn().mockReturnValue([
              {
                id: 1,
                title: "test-title",
                content: "test-content",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          },
        },
      },
    };
  };
  const t = initTRPC.context<typeof createTRPCContext>().create();
  // @ts-expect-error, we skip typechecking due to testing context only
  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller(createTRPCContext());

  it("should post all", async () => {
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
});
