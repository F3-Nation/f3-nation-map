import type { PgDatabase } from "drizzle-orm/pg-core";
import type { MdAdapter } from "next-auth";
import { and, eq } from "drizzle-orm";
import omit from "lodash/omit";

import type { UserRole } from "@acme/shared/app/enums";
import { schema, sql } from "@acme/db";

const {
  users,
  roles,
  orgs,
  rolesXUsersXOrg,
  authAccounts: accounts,
  authSessions: sessions,
  authVerificationTokens: verificationTokens,
} = schema;

type NonNullableProps<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];

function stripUndefined<T>(obj: T): Pick<T, NonNullableProps<T>> {
  const result = {} as T;
  for (const key in obj) if (obj[key] !== undefined) result[key] = obj[key];
  return result;
}

const getUser = async (
  data: { id: number } | { email: string },
  client: InstanceType<typeof PgDatabase>,
) => {
  if (LOG) console.log("getUser", data);
  const user = await client
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      editingRegionIds: sql<string[]>`array_agg(${rolesXUsersXOrg.orgId})`,
      roles: sql<
        { orgId: number; orgName: string; roleName: UserRole }[]
      >`COALESCE(
          json_agg(
            json_build_object(
              'orgId', ${schema.orgs.id}, 
              'orgName', ${schema.orgs.name}, 
              'roleName', ${schema.roles.name}
            )
          ) 
          FILTER (
            WHERE ${schema.orgs.id} IS NOT NULL
          ), 
          '[]'
        )`,
    })
    .from(users)
    .leftJoin(rolesXUsersXOrg, eq(users.id, rolesXUsersXOrg.userId))
    .leftJoin(roles, eq(rolesXUsersXOrg.roleId, roles.id))
    .leftJoin(orgs, eq(orgs.id, rolesXUsersXOrg.orgId))
    .where("id" in data ? eq(users.id, data.id) : eq(users.email, data.email))
    .groupBy(users.id)
    .then((res) => res[0] ?? null);

  if (!user) return null;

  return {
    ...user,
    editingRegionIds: user.editingRegionIds.map((r) => Number(r)) ?? [],
  };
};

const LOG = true;
export function MDPGDrizzleAdapter(
  client: InstanceType<typeof PgDatabase>,
): MdAdapter {
  return {
    async createUser(data) {
      if (LOG) console.log("createUser", data);
      const { id: userId } = await client
        .insert(users)
        .values({ ...omit(data, "id") })
        .returning()
        // .onConflictDoNothing()
        .then((res) => res[0]!);

      const user = await getUser({ id: userId }, client);

      if (!user) throw new Error("User not found.");

      return user;
    },
    async getUser(data) {
      if (LOG) console.log("getUser", data);
      return await getUser({ id: data }, client);
    },
    async getUserByEmail(data) {
      if (LOG) console.log("getUserByEmail", data);
      return await getUser({ email: data }, client);
    },
    async createSession(data) {
      if (LOG) console.log("createSession", data);
      return await client
        .insert(sessions)
        .values(data)
        .returning()
        .then((res) => res[0]!);
    },
    async getSessionAndUser(data) {
      if (LOG) console.log("getSessionAndUser", data);
      const session = await client
        .select({
          session: sessions,
          user: {
            id: users.id,
            email: users.email,
            emailVerified: users.emailVerified,
            roles: sql<
              { orgId: number; orgName: string; roleName: UserRole }[]
            >`COALESCE(
              json_agg(
                json_build_object(
                  'orgId', ${schema.orgs.id}, 
                  'orgName', ${schema.orgs.name}, 
                  'roleName', ${schema.roles.name}
                )
              ) 
              FILTER (
                WHERE ${schema.orgs.id} IS NOT NULL
              ), 
              '[]'
            )`,
          },
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, data))
        .innerJoin(users, eq(users.id, sessions.userId))
        .leftJoin(rolesXUsersXOrg, eq(users.id, rolesXUsersXOrg.userId))
        .leftJoin(orgs, eq(orgs.id, rolesXUsersXOrg.orgId))
        .leftJoin(roles, eq(rolesXUsersXOrg.roleId, roles.id))
        .groupBy(users.id)
        .then((res) => res[0] ?? null);

      return session
        ? {
            ...session,
            user: {
              ...session.user,
            },
          }
        : null;
    },
    async updateUser(data) {
      if (LOG) console.log("updateUser", data);
      if (!data.id) {
        throw new Error("No user id.");
      }

      await client
        .update(users)
        .set({
          id: data.id,
          email: data.email,
        })
        .where(eq(users.id, data.id));

      const user = await getUser({ id: data.id }, client);

      if (!user) throw new Error("User not found.");

      return user;
    },
    async updateSession(data) {
      if (LOG) console.log("updateSession", data);
      return await client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .then((res) => res[0]);
    },
    async linkAccount(rawAccount) {
      if (LOG) console.log("linkAccount", rawAccount);
      return stripUndefined(
        await client
          .insert(accounts)
          .values(rawAccount)
          // .onConflictDoNothing()
          .returning()
          .then((res) => res[0]!),
      );
    },
    async getUserByAccount(account) {
      if (LOG) console.log("getUserByAccount", account);
      const userId = await client
        .select({ userId: accounts.userId })
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        )
        .then((res) => res[0]?.userId ?? null);

      if (!userId) return null;

      return await getUser({ id: userId }, client);
    },
    async deleteSession(sessionToken) {
      if (LOG) console.log("deleteSession", sessionToken);
      const session = await client
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning()
        .then((res) => res[0] ?? null);

      return session;
    },
    async createVerificationToken(token) {
      if (LOG) console.log("createVerificationToken", token);
      return await client
        .insert(verificationTokens)
        .values(token)
        .returning()
        .then((res) => res[0]);
    },
    async useVerificationToken(token) {
      try {
        if (LOG) console.log("useVerificationToken", token);
        return await client
          .select()
          .from(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token),
            ),
          )
          .then((res) => res[0] ?? null);
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    async deleteUser(id) {
      if (LOG) console.log("deleteUser", id);
      await client
        .delete(users)
        .where(eq(users.id, id))
        .returning()
        .then((res) => res[0] ?? null);
    },
    async unlinkAccount(account) {
      if (LOG) console.log("unlinkAccount", account);
      const { type, provider, providerAccountId, userId } = await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        )
        .returning()
        .then((res) => res[0]!);

      return { provider, type, providerAccountId, userId };
    },
  };
}
