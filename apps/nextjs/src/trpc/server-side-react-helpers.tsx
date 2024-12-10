import { QueryClient } from "@tanstack/react-query";
import { httpLink, loggerLink } from "@trpc/client";
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@f3/api";

export const api = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const globalTrpcClient = api.createClient({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      async headers() {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-react");
        return headers;
      },
    }),
    // unstable_httpBatchStreamLink({
    //   transformer: SuperJSON,
    //   url: getBaseUrl() + "/api/trpc",
    //   async headers() {
    //     const headers = new Headers();
    //     headers.set("x-trpc-source", "nextjs-react");
    //     return headers;
    //   },
    // }),
  ],
});

export const clientUtils = createTRPCQueryUtils({
  queryClient: globalQueryClient,
  client: globalTrpcClient,
});
