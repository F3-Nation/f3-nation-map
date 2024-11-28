"use client";

import React, { Suspense, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import {
  api,
  globalQueryClient,
  globalTrpcClient,
} from "./server-side-react-helpers";

export { api };

// https://tanstack.com/query/latest/docs/framework/react/devtools
const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => globalQueryClient);

  const [showDevtools, setShowDevtools] = useState(
    process.env.NODE_ENV === "development" && false,
  );

  const [trpcClient] = useState(() => globalTrpcClient);

  useEffect(() => {
    // @ts-expect-error -- add toggleDevtools to window
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
        {showDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtoolsProduction buttonPosition="bottom-left" />
          </Suspense>
        )}
      </api.Provider>
    </QueryClientProvider>
  );
}
