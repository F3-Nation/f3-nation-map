import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import type {
  DeleteRequestResponse,
  UpdateRequestResponse,
} from "@acme/validators";
import { appRouter, createTRPCContext } from "@acme/api";
import { notifyWebhooks } from "@acme/api/lib/notify-webhooks";
import { auth } from "@acme/auth";

const updateDataPath = [
  "event.crupdate",
  "event.delete",
  "location.crupdate",
  "location.delete",
  "org.crupdate",
  "org.delete",
  "request.validateSubmissionByAdmin",
  "request.validateDeleteByAdmin",
  "request.validateSubmission",
];

const conditionalDataPath = [
  "request.submitUpdateRequest",
  "request.submitDeleteRequest",
];
const REQUEST_FAILED_ERROR = "Request failed";
const NO_TRPC_ROUTE_ERROR = "No trpc route found";

interface TrpcResponse<
  T extends UpdateRequestResponse | DeleteRequestResponse,
> {
  result: { data: { json: T } };
}

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
function setCorsHeaders(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
}

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = auth(async (req) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        session: req.auth,
        headers: req.headers,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  try {
    let didUpdateData = false;

    const trpcRoute = req.url.match(/.*\/api\/trpc\/(.*)$/)?.[1];
    if (!trpcRoute) throw new Error(NO_TRPC_ROUTE_ERROR);

    if (!response.ok) throw new Error(REQUEST_FAILED_ERROR);

    if (updateDataPath.includes(trpcRoute)) {
      didUpdateData = true;
    } else if (conditionalDataPath.includes(trpcRoute)) {
      const clonedResponse = response.clone();
      if (trpcRoute === "request.submitUpdateRequest") {
        const body =
          (await clonedResponse.json()) as TrpcResponse<UpdateRequestResponse>;
        const data = body?.result?.data?.json;
        didUpdateData = data.status === "approved";
      } else if (trpcRoute === "request.submitDeleteRequest") {
        const body =
          (await clonedResponse.json()) as TrpcResponse<DeleteRequestResponse>;
        const data = body?.result?.data?.json;
        didUpdateData = data.status === "approved";
      }
    }

    if (didUpdateData) {
      console.log("didUpdateData is true!");
      after(() => {
        console.log("revalidating path", "/");
        revalidatePath("/");
        void notifyWebhooks();
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (![NO_TRPC_ROUTE_ERROR, REQUEST_FAILED_ERROR].includes(message)) {
      console.error("Error evaluating response for revalidation", message);
    }
  }

  setCorsHeaders(response);
  return response;
});

export { handler as GET, handler as POST };
