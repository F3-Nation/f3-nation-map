import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq, ne, schema } from "@acme/db";
import { NationInsertSchema } from "@acme/validators";

import { checkHasRoleOnOrg } from "../check-has-role-on-org";
import {
  adminProcedure,
  createTRPCRouter,
  editorProcedure,
  publicProcedure,
} from "../trpc";

export const nationRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const nations = await ctx.db
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
      })
      .from(schema.orgs)
      .where(
        and(eq(schema.orgs.orgType, "nation"), eq(schema.orgs.isActive, true)),
      );

    return nations;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [nation] = await ctx.db
        .select()
        .from(schema.orgs)
        .where(
          and(eq(schema.orgs.id, input.id), eq(schema.orgs.orgType, "nation")),
        );
      return { ...nation };
    }),

  crupdate: editorProcedure
    .input(NationInsertSchema.partial({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const orgIdToCheck = input.id;
      if (!orgIdToCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID is required",
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
          message: "You are not authorized to update this Nation",
        });
      }

      if (input.id) {
        const [existingOrg] = await ctx.db
          .select()
          .from(schema.orgs)
          .where(eq(schema.orgs.id, input.id));
        if (existingOrg?.orgType !== "nation") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "org to edit is not a nation",
          });
        }
      }

      const nationToCrupdate: typeof schema.orgs.$inferInsert = {
        ...input,
        orgType: "nation",
        meta: {
          ...(input.meta as Record<string, string>),
        },
      };
      const [result] = await ctx.db
        .insert(schema.orgs)
        .values(nationToCrupdate)
        .onConflictDoUpdate({
          target: [schema.orgs.id],
          set: nationToCrupdate,
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
          message: "You are not authorized to delete this Nation",
        });
      }
      await ctx.db
        .update(schema.orgs)
        .set({ isActive: false })
        .where(
          and(
            eq(schema.orgs.id, input.id),
            eq(schema.orgs.orgType, "nation"),
            eq(schema.orgs.isActive, true),
          ),
        );
    }),
  allOrgs: publicProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.db
      .select()
      .from(schema.orgs)
      .where(
        and(eq(schema.orgs.isActive, true), ne(schema.orgs.orgType, "ao")),
      );
    return orgs;
  }),
});
