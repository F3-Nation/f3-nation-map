import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter, createTRPCContext } from "@f3/api";

export const serverSideHelpers = createServerSideHelpers({
  router: appRouter,
  ctx: await createTRPCContext({ session: null, headers: null }),
  transformer: superjson, // optional - adds superjson serialization
});
