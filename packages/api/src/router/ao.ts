import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aliasedTable, eq, schema } from "@f3/db";
import { AOInsertSchema } from "@f3/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { createTRPCRouter, editorProcedure, publicProcedure } from "../trpc";

export const aoRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const sectorOrg = aliasedTable(schema.orgs, "sector_org");
    const areaOrg = aliasedTable(schema.orgs, "area_org");
    const regionOrg = aliasedTable(schema.orgs, "region_org");
    const nationOrg = aliasedTable(schema.orgs, "nation_org");
    const aoOrg = aliasedTable(schema.orgs, "ao_org");

    const aos = await ctx.db
      .select({
        id: aoOrg.id,
        parentId: aoOrg.parentId,
        name: aoOrg.name,
        orgType: aoOrg.orgType,
        defaultLocationId: aoOrg.defaultLocationId,
        description: aoOrg.description,
        isActive: aoOrg.isActive,
        logoUrl: aoOrg.logoUrl,
        website: aoOrg.website,
        email: aoOrg.email,
        twitter: aoOrg.twitter,
        facebook: aoOrg.facebook,
        instagram: aoOrg.instagram,
        lastAnnualReview: aoOrg.lastAnnualReview,
        meta: aoOrg.meta,
        created: aoOrg.created,
        sector: sectorOrg.name,
        area: areaOrg.name,
        region: regionOrg.name,
        nation: nationOrg.name,
      })
      .from(aoOrg)
      .innerJoin(regionOrg, eq(aoOrg.parentId, regionOrg.id))
      .innerJoin(areaOrg, eq(regionOrg.parentId, areaOrg.id))
      .innerJoin(sectorOrg, eq(areaOrg.parentId, sectorOrg.id))
      .innerJoin(nationOrg, eq(sectorOrg.parentId, nationOrg.id))
      .where(eq(aoOrg.orgType, "ao"));

    return aos;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [ao] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(eq(schema.orgs.id, input.id));
      return { ...ao };
    }),

  crupdate: editorProcedure
    .input(AOInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      if (!input.parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Parent ID is required",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: input.parentId,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this AO",
        });
      }
      const aoToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgType: "ao",
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      await ctx.db
        .insert(schema.orgs)
        .values(aoToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: aoToCrupdate,
        });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(schema.orgs).where(eq(schema.orgs.id, input.id));
    }),
});
