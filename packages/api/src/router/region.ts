import { z } from "zod";

import { aliasedTable, eq, schema } from "@f3/db";
import { RegionInsertSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const regionRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const sectorOrg = aliasedTable(schema.orgs, "sector_org");
    const nationOrg = aliasedTable(schema.orgs, "nation_org");

    const regions = await ctx.db
      .select({
        id: regionOrg.id,
        parentId: regionOrg.parentId,
        name: regionOrg.name,
        orgTypeId: regionOrg.orgTypeId,
        defaultLocationId: regionOrg.defaultLocationId,
        description: regionOrg.description,
        isActive: regionOrg.isActive,
        logoUrl: regionOrg.logoUrl,
        website: regionOrg.website,
        email: regionOrg.email,
        twitter: regionOrg.twitter,
        facebook: regionOrg.facebook,
        instagram: regionOrg.instagram,
        lastAnnualReview: regionOrg.lastAnnualReview,
        meta: regionOrg.meta,
        created: regionOrg.created,
        area: schema.orgs.name,
        sector: sectorOrg.name,
        nation: nationOrg.name,
      })
      .from(regionOrg)
      .innerJoin(schema.orgTypes, eq(regionOrg.orgTypeId, schema.orgTypes.id))
      .innerJoin(schema.orgs, eq(regionOrg.parentId, schema.orgs.id))
      .innerJoin(sectorOrg, eq(schema.orgs.parentId, sectorOrg.id))
      .innerJoin(nationOrg, eq(sectorOrg.parentId, nationOrg.id))
      .where(eq(schema.orgTypes.name, "Region"));

    return regions;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [region] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.id));
      return { ...region };
    }),

  crupdate: publicProcedure

    .input(RegionInsertSchema.partial({ id: true, orgTypeId: true }))
    .mutation(async ({ ctx, input }) => {
      const regionOrgType = await ctx.db
        .select({
          id: schema.orgTypes.id,
        })
        .from(schema.orgTypes)
        .where(eq(schema.orgTypes.name, "Region"));

      if (regionOrgType === undefined)
        throw new Error("Region org type not found");
      const regionToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgTypeId: regionOrgType[0]?.id ?? -1,
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(regionToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: regionToCrupdate,
        });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(schema.orgs).where(eq(schema.orgs.id, input.id));
    }),
});
