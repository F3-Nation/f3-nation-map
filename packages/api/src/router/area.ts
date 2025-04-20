import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aliasedTable, and, eq, schema } from "@acme/db";
import { AreaInsertSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import { adminProcedure, createTRPCRouter, editorProcedure } from "../trpc";

export const areaRouter = createTRPCRouter({
  all: editorProcedure.query(async ({ ctx }) => {
    const areaOrg = aliasedTable(schema.orgs, "area_org");
    const sectorOrg = aliasedTable(schema.orgs, "sector_org");

    const areas = await ctx.db
      .select({
        id: areaOrg.id,
        name: areaOrg.name,
        orgType: areaOrg.orgType,
        defaultLocationId: areaOrg.defaultLocationId,
        description: areaOrg.description,
        isActive: areaOrg.isActive,
        logoUrl: areaOrg.logoUrl,
        website: areaOrg.website,
        email: areaOrg.email,
        twitter: areaOrg.twitter,
        facebook: areaOrg.facebook,
        instagram: areaOrg.instagram,
        lastAnnualReview: areaOrg.lastAnnualReview,
        meta: areaOrg.meta,
        created: areaOrg.created,
        sector: sectorOrg.name,
      })
      .from(areaOrg)
      .innerJoin(sectorOrg, eq(areaOrg.parentId, sectorOrg.id))
      .where(and(eq(areaOrg.orgType, "area"), eq(areaOrg.isActive, true)));

    return areas;
  }),

  byId: editorProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const areaOrg = aliasedTable(schema.orgs, "area_org");
      const [area] = await ctx.db
        .select()
        .from(areaOrg)
        .where(and(eq(areaOrg.id, input.id), eq(areaOrg.orgType, "area")));
      return { ...area };
    }),

  crupdate: editorProcedure
    .input(AreaInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const orgIdToCheck = input.id ?? input.parentId;
      if (!orgIdToCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Parent ID or ID is required",
        });
      }
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: orgIdToCheck,
        session: ctx.session,
        db: ctx.db,
        roleName: "editor",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this area",
        });
      }
      if (input.id) {
        const [existingOrg] = await ctx.db
          .select()
          .from(schema.orgs)
          .where(eq(schema.orgs.id, input.id));
        if (existingOrg?.orgType !== "area") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "org to edit is not an area",
          });
        }
      }
      const areaToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgType: "area",
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      const [result] = await ctx.db
        .insert(schema.orgs)
        .values(areaToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: areaToCrupdate,
        })
        .returning();
      return result;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const roleCheckResult = await checkHasRoleOnOrg({
        orgId: input.id,
        session: ctx.session,
        db: ctx.db,
        roleName: "admin",
      });
      if (!roleCheckResult.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this Area",
        });
      }
      await ctx.db
        .update(schema.orgs)
        .set({ isActive: false })
        .where(
          and(
            eq(schema.orgs.id, input.id),
            eq(schema.orgs.orgType, "area"),
            eq(schema.orgs.isActive, true),
          ),
        );
    }),
});
