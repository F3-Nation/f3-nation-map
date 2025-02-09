import type { PgDatabase } from "drizzle-orm/pg-core";
import type {
  AdapterAuthenticator,
  VerificationToken,
} from "next-auth/adapters";
import type { ProviderType } from "next-auth/providers";
import { and, eq } from "drizzle-orm";
import omit from "lodash/omit";

import { schema } from "@f3/db";

const {
  users,
  nextAuthAccounts: accounts,
  nextAuthSessions: sessions,
  nextAuthVerificationTokens: verificationTokens,
} = schema;

type NonNullableProps<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];

function stripUndefined<T>(obj: T): Pick<T, NonNullableProps<T>> {
  const result = {} as T;
  for (const key in obj) if (obj[key] !== undefined) result[key] = obj[key];
  return result;
}

const LOG = true;
export function MDPGDrizzleAdapter(
  client: InstanceType<typeof PgDatabase>,
): CustomAdapter {
  return {
    async createUser(data) {
      if (LOG) console.log("createUser", data);
      return await client
        .insert(users)
        .values({ ...omit(data, "id") })
        .returning()
        .then((res) => res[0]!);
    },
    async getUser(data) {
      if (LOG) console.log("getUser", data);
      return await client
        .select()
        .from(users)
        .where(eq(users.id, data))
        .then((res) => res[0] ?? null);
    },
    async getUserByEmail(data) {
      if (LOG) console.log("getUserByEmail", data);
      return await client
        .select()
        .from(users)
        .where(eq(users.email, data))
        .then((res) => res[0] ?? null);
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
      return await client
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, data))
        .innerJoin(users, eq(users.id, sessions.userId))
        .then((res) => res[0] ?? null);
    },
    async updateUser(data) {
      if (LOG) console.log("updateUser", data);
      if (!data.id) {
        throw new Error("No user id.");
      }

      return await client
        .update(users)
        .set({
          id: data.id,
          email: data.email,
        })
        .where(eq(users.id, data.id))
        .returning()
        .then((res) => res[0]!);
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
          .returning()
          .then((res) => res[0]!),
      );
    },
    async getUserByAccount(account) {
      if (LOG) console.log("getUserByAccount", account);
      const dbAccount =
        (await client
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider),
            ),
          )
          .leftJoin(users, eq(accounts.userId, users.id))
          .then((res) => res[0])) ?? null;

      return dbAccount?.users ?? null;
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

interface AdapterUser {
  id: number;
  email: string;
  emailVerified: Date | null;
}

interface AdapterSession {
  userId: number;
  sessionToken: string;
  expires: Date;
}

interface AdapterAccount {
  userId: number;
  type: Extract<ProviderType, "oauth" | "oidc" | "email" | "webauthn">;
  provider: string;
  providerAccountId: string;
}

export interface CustomAdapter {
  /**
   * Creates a user in the database and returns it.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  createUser?(user: AdapterUser): Awaitable<AdapterUser>;
  /**
   * Returns a user from the database via the user id.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  getUser?(id: number): Awaitable<AdapterUser | null>;
  /**
   * Returns a user from the database via the user's email address.
   *
   * See also [Verification tokens](https://authjs.dev/guides/adapters/creating-a-database-adapter#verification-tokens)
   */
  getUserByEmail?(email: string): Awaitable<AdapterUser | null>;
  /**
   * Using the provider id and the id of the user for a specific account, get the user.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  getUserByAccount?(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">,
  ): Awaitable<AdapterUser | null>;
  /**
   * Updates a user in the database and returns it.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  updateUser?(
    user: Partial<AdapterUser> & Pick<AdapterUser, "id">,
  ): Awaitable<AdapterUser>;
  /**
   * @todo This method is currently not invoked yet.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  deleteUser?(
    userId: number,
  ): Promise<void> | Awaitable<AdapterUser | null | undefined>;
  /**
   * This method is invoked internally (but optionally can be used for manual linking).
   * It creates an [Account](https://authjs.dev/reference/core/adapters#models) in the database.
   *
   * See also [User management](https://authjs.dev/guides/adapters/creating-a-database-adapter#user-management)
   */
  linkAccount?(
    account: AdapterAccount,
  ): Promise<void> | Awaitable<AdapterAccount | null | undefined>;
  /** @todo This method is currently not invoked yet. */
  unlinkAccount?(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">,
  ): Promise<void> | Awaitable<AdapterAccount | undefined>;
  /**
   * Creates a session for the user and returns it.
   *
   * See also [Database Session management](https://authjs.dev/guides/adapters/creating-a-database-adapter#database-session-management)
   */
  createSession?(session: {
    sessionToken: string;
    userId: number;
    expires: Date;
  }): Awaitable<AdapterSession>;
  /**
   * Returns a session and a userfrom the database in one go.
   *
   * :::tip
   * If the database supports joins, it's recommended to reduce the number of database queries.
   * :::
   *
   * See also [Database Session management](https://authjs.dev/guides/adapters/creating-a-database-adapter#database-session-management)
   */
  getSessionAndUser?(
    sessionToken: string,
  ): Awaitable<{ session: AdapterSession; user: AdapterUser } | null>;
  /**
   * Updates a session in the database and returns it.
   *
   * See also [Database Session management](https://authjs.dev/guides/adapters/creating-a-database-adapter#database-session-management)
   */
  updateSession?(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">,
  ): Awaitable<AdapterSession | null | undefined>;
  /**
   * Deletes a session from the database. It is preferred that this method also
   * returns the session that is being deleted for logging purposes.
   *
   * See also [Database Session management](https://authjs.dev/guides/adapters/creating-a-database-adapter#database-session-management)
   */
  deleteSession?(
    sessionToken: string,
  ): Promise<void> | Awaitable<AdapterSession | null | undefined>;
  /**
   * Creates a verification token and returns it.
   *
   * See also [Verification tokens](https://authjs.dev/guides/adapters/creating-a-database-adapter#verification-tokens)
   */
  createVerificationToken?(
    verificationToken: VerificationToken,
  ): Awaitable<VerificationToken | null | undefined>;
  /**
   * Return verification token from the database and deletes it
   * so it can only be used once.
   *
   * See also [Verification tokens](https://authjs.dev/guides/adapters/creating-a-database-adapter#verification-tokens)
   */
  useVerificationToken?(params: {
    identifier: string;
    token: string;
  }): Awaitable<VerificationToken | null>;
  /**
   * Get account by provider account id and provider.
   *
   * If an account is not found, the adapter must return `null`.
   */
  getAccount?(
    providerAccountId: AdapterAccount["providerAccountId"],
    provider: AdapterAccount["provider"],
  ): Awaitable<AdapterAccount | null>;
  /**
   * Returns an authenticator from its credentialID.
   *
   * If an authenticator is not found, the adapter must return `null`.
   */
  getAuthenticator?(
    credentialID: AdapterAuthenticator["credentialID"],
  ): Awaitable<AdapterAuthenticator | null>;
  /**
   * Create a new authenticator.
   *
   * If the creation fails, the adapter must throw an error.
   */
  createAuthenticator?(
    authenticator: AdapterAuthenticator,
  ): Awaitable<AdapterAuthenticator>;
  /**
   * Returns all authenticators from a user.
   *
   * If a user is not found, the adapter should still return an empty array.
   * If the retrieval fails for some other reason, the adapter must throw an error.
   */
  listAuthenticatorsByUserId?(
    userId: AdapterAuthenticator["userId"],
  ): Awaitable<AdapterAuthenticator[]>;
  /**
   * Updates an authenticator's counter.
   *
   * If the update fails, the adapter must throw an error.
   */
  updateAuthenticatorCounter?(
    credentialID: AdapterAuthenticator["credentialID"],
    newCounter: AdapterAuthenticator["counter"],
  ): Awaitable<AdapterAuthenticator>;
}
export type Awaitable<T> = T | PromiseLike<T>;
export type Awaited<T> = T extends Promise<infer U> ? U : T;
