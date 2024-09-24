import { generateOpenApiDocument } from "trpc-openapi";

import { env } from "@f3/env";

import { appRouter } from ".";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "f3-api",
  version: "1.0.0",
  description: "API for F3 Nation",
  baseUrl: env.NEXT_PUBLIC_URL,
});
