import type { Adapter } from "next-auth/adapters";
import NextAuth from "next-auth";
import Email from "next-auth/providers/nodemailer";

import { db } from "@f3/db";
import { env } from "@f3/env";

import { MDPGDrizzleAdapter } from "./MDPgDrizzleAdapter";
import { sendVerificationRequest } from "./sendVerificationRequest";

export type { Session } from "next-auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // Must cast since we use number for user ids
  // And next-auth expects string for user ids
  // And it is a nightmare (impossible?) to overwrite the type
  adapter: MDPGDrizzleAdapter(db) as Adapter,
  providers: [
    Email({
      id: "email", // needed to allow signIn("email")
      name: "Email", // Changes text on default sign in button
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
});
