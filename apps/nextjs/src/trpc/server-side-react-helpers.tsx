import { QueryClient } from "@tanstack/react-query";
import { httpLink, loggerLink } from "@trpc/client";
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";

import { getBaseUrl } from "./util";

export const api = createTRPCReact<AppRouter>();

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
