import { z } from "zod";

import { aliasedTable, and, eq, schema } from "@acme/db";
import { SectorInsertSchema } from "@acme/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const sectorRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const nationOrg = aliasedTable(schema.orgs, "nation_org");
    const sectors = await ctx.db
      .select({
        id: schema.orgs.id,
        parentId: schema.orgs.parentId,
        name: schema.orgs.name,
        orgType: schema.orgs.orgType,
        defaultLocationId: schema.orgs.defaultLocationId,
        description: schema.orgs.description,
        isActive: schema.orgs.isActive,
        logoUrl: schema.orgs.logoUrl,
        website: schema.orgs.website,
        email: schema.orgs.email,
        twitter: schema.orgs.twitter,
        facebook: schema.orgs.facebook,
        instagram: schema.orgs.instagram,
        lastAnnualReview: schema.orgs.lastAnnualReview,
        meta: schema.orgs.meta,
        created: schema.orgs.created,
        nation: nationOrg.name,
      })
      .from(schema.orgs)
      .innerJoin(nationOrg, eq(schema.orgs.parentId, nationOrg.id))
      .where(
        and(eq(schema.orgs.orgType, "sector"), eq(schema.orgs.isActive, true)),
      );

    return sectors;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [sector] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.id));
      return { ...sector };
    }),

  crupdate: publicProcedure
    .input(SectorInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const sectorOrgType = await ctx.db
        .select({
          id: schema.orgs.id,
        })
        .from(schema.orgs)
        .where(eq(schema.orgs.orgType, "sector"));

      if (sectorOrgType === undefined)
        throw new Error("Sector org type not found");

      const sectorToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgType: "sector",
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(sectorToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: sectorToCrupdate,
        });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.orgs)
        .set({ isActive: false })
        .where(eq(schema.orgs.id, input.id));
    }),
});
