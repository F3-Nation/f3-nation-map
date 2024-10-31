import { and, eq, or, schema } from "@f3/db";

import { expansionUsers } from "../../../db/src/schema/expansionUsers";
import { ExpansionUserInsertSchema } from "../../../validators/src";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const expansionUsersRouter = createTRPCRouter({
  getExpansionUsers: publicProcedure.query(async ({ ctx }) => {
    const expansion_users = await ctx.db
      .select({
        id: schema.expansionUsers.id,
        area: schema.expansionUsers.area,
        userLat: schema.expansionUsers.userLat,
        userLng: schema.expansionUsers.userLng,
        pinnedLat: schema.expansionUsers.pinnedLat,
        pinnedLng: schema.expansionUsers.pinnedLng,
        interestedInOrganizing: schema.expansionUsers.interestedInOrganizing,
        phone: schema.expansionUsers.phone,
        email: schema.expansionUsers.email,
        created: schema.expansionUsers.created,
        updated: schema.expansionUsers.updated,
      })
      .from(schema.expansionUsers);

    return expansion_users;
  }),
  createExpansionUser: publicProcedure
    .input(ExpansionUserInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const checkExists = await ctx.db
        .select({ id: schema.expansionUsers.id })
        .from(schema.expansionUsers)
        .where(
          and(
            eq(
              expansionUsers.pinnedLng,
              Number(input.pinnedLng).toFixed(5) as unknown as number,
            ),
            eq(
              expansionUsers.pinnedLat,
              Number(input.pinnedLat).toFixed(5) as unknown as number,
            ),
            or(
              eq(expansionUsers.email, input.email),
              eq(expansionUsers.phone, input.phone),
            ),
          ),
        );
      if (checkExists.length > 0) {
        throw new Error("There is already an expansion feedback on this area.");
      } else {
        return ctx.db.insert(schema.expansionUsers).values({
          area: input.area,
          pinnedLat: input.pinnedLat as number,
          pinnedLng: input.pinnedLng as number,
          userLat: input.userLat as number,
          userLng: input.userLng as number,
          interestedInOrganizing: input.interestedInOrganizing,
          phone: input.phone,
          email: input.email,
        });
      }
    }),
});
