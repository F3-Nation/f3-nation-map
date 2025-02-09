import { z } from "zod";

import type { UserRole } from "@f3/shared/app/enums";
import { eq, schema as schemaRaw, sql } from "@f3/db";
import { CrupdateUserSchema } from "@f3/validators";

import { createTRPCRouter, publicProcedure } from "../trpc";

const schema = { ...schemaRaw, users: schemaRaw.users };

export const userRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db
      .select({
        id: schema.users.id,
        f3Name: schema.users.f3Name,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        phone: schema.users.phone,
        homeRegionId: schema.users.homeRegionId,
        avatarUrl: schema.users.avatarUrl,
        emergencyContact: schema.users.emergencyContact,
        emergencyPhone: schema.users.emergencyPhone,
        emergencyNotes: schema.users.emergencyNotes,
        role: schema.users.role,
        status: schema.users.status,
        meta: schema.users.meta,
        created: schema.users.created,
        updated: schema.users.updated,
        regions: sql<
          { id: number; name: string; role: UserRole }[]
        >`json_agg(json_build_object('id', ${schema.rolesXUsersXOrg.orgId}, 'name', ${schema.orgs.name}, 'role', ${schema.roles.name}))`,
      })
      .from(schema.users)
      .leftJoin(
        schema.updateRequests,
        eq(schema.users.email, schema.updateRequests.submittedBy),
      )
      .leftJoin(
        schema.rolesXUsersXOrg,
        eq(schema.users.id, schema.rolesXUsersXOrg.userId),
      )
      .leftJoin(schema.orgs, eq(schema.orgs.id, schema.rolesXUsersXOrg.orgId))
      .leftJoin(
        schema.roles,
        eq(schema.roles.id, schema.rolesXUsersXOrg.roleId),
      )
      .groupBy(schema.users.id);
    return users.map((user) => ({
      ...user,
      regions: user.regions,
      name: `${user.firstName} ${user.lastName}`,
    }));
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: schema.users.id,
          f3Name: schema.users.f3Name,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          role: schema.users.role,
          status: schema.users.status,
          regions: sql<
            { id: number; name: string; role: UserRole }[]
          >`json_agg(json_build_object('id', ${schema.rolesXUsersXOrg.orgId}, 'name', ${schema.orgs.name}, 'role', ${schema.roles.name}))`,
        })
        .from(schema.users)
        .leftJoin(
          schema.rolesXUsersXOrg,
          eq(schema.users.id, schema.rolesXUsersXOrg.userId),
        )
        .leftJoin(schema.orgs, eq(schema.orgs.id, schema.rolesXUsersXOrg.orgId))
        .leftJoin(
          schema.roles,
          eq(schema.roles.id, schema.rolesXUsersXOrg.roleId),
        )
        .groupBy(schema.users.id)
        .where(eq(schema.users.id, input.id));
      return !user
        ? null
        : {
            ...user,
            regions: user.regions.filter((r) => r.id != undefined),
          };
    }),
  crupdate: publicProcedure
    .input(CrupdateUserSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
      const { regionIds, ...rest } = input;
      const [user] = await ctx.db
        .insert(schema.users)
        .values({
          ...rest,
        })
        .onConflictDoUpdate({
          target: [schema.users.id],
          set: input,
        })
        .returning();

      if (!user) {
        throw new Error("User not found");
      }

      const [editorRole] = await ctx.db
        .select({ id: schema.roles.id })
        .from(schema.roles)
        .where(eq(schema.roles.name, "editor"));

      if (!editorRole) {
        throw new Error("Editor role not found");
      }

      await ctx.db
        .delete(schema.rolesXUsersXOrg)
        .where(eq(schema.rolesXUsersXOrg.userId, user.id));

      await ctx.db.insert(schema.rolesXUsersXOrg).values(
        regionIds.map((regionId) => ({
          userId: user.id,
          roleId: editorRole.id,
          orgId: regionId,
        })),
      );

      return user;
    }),
});
