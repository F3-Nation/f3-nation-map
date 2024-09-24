import { and, countDistinct, eq, schema } from "@f3/db";

import { publicProcedure } from "../trpc";

export const defaultRouter = {
  metrics: publicProcedure.query(async ({ ctx }) => {
    //
    const [[workouts], [regions]] = await Promise.all([
      ctx.db
        .select({
          count: countDistinct(schema.events.id),
        })
        .from(schema.events),
      ctx.db
        .select({
          count: countDistinct(schema.orgs.id),
        })
        .from(schema.orgs)
        .innerJoin(
          schema.orgTypes,
          eq(schema.orgs.orgTypeId, schema.orgTypes.id),
        )
        .where(
          and(
            eq(schema.orgs.isActive, true),
            eq(schema.orgTypes.name, "Region"),
          ),
        ),
    ]);

    return { workouts: workouts?.count, regions: regions?.count };
  }),
};
