import { createTRPCClient, httpLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@f3/api";
import { AppType } from "@f3/shared/app/constants";
import { Header } from "@f3/shared/common/enums";

import { getBaseUrl } from "./util";

export const vanillaApi = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      transformer: superjson,
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const headers = new Headers();
        headers.set(Header.Source, AppType.WEB);
        return headers;
      },
    }),
  ],
});
