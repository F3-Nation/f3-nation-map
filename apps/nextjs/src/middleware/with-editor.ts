import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { env } from "@f3/env";
import { EDITOR_PATHS, routes } from "@f3/shared/app/constants";

import type { MiddlewareFactory } from "./types";

const withAdmin: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const res = await next(request, _next);

    if (!EDITOR_PATHS.includes(request.nextUrl.pathname)) {
      return res;
    }

    const [cookieToken] = request.cookies
      .getAll()
      .filter((o) => o.name.includes("authjs.session-token"));

    // Must use process.env so that we don't try to validate all the other envs
    const secret = env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET is not set");

    if (!cookieToken) {
      return NextResponse.redirect(
        new URL(`${routes.auth.signIn.__path}?reason=no-cookie`, request.url),
      );
    }

    const payload = await getToken({
      req: request,
      secret,
      salt: cookieToken.name,
      cookieName: cookieToken.name,
    });

    if (payload?.role !== "editor" && payload?.role !== "admin") {
      return NextResponse.redirect(
        new URL(`${routes.auth.signIn.__path}?reason=not-editor`, request.url),
      );
    }

    return res;
  };
};

export default withAdmin;
