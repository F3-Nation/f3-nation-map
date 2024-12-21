import { Suspense } from "react";
import { redirect } from "next/navigation";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { ValidateSubmission } from "./validate-submission";

// NOTE: This path (validate-submission) is used in validate-submission.hbs. Please update in both places if changed.

export default async function ValidateSubmissionPage({
  searchParams,
}: {
  searchParams: { token?: string; submissionId?: string };
}) {
  RERENDER_LOGS && console.log("ValidateSubmissionPage rerender");

  if (!searchParams.token || !searchParams.submissionId) {
    redirect("/?error=invalid-submission");
  }

  return (
    <main className="pointer-events-auto relative max-h-screen gap-4 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-[3%] py-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-lg font-semibold">
                Validating submission...
              </div>
              <div className="text-muted-foreground">
                Please wait while we process your request
              </div>
            </div>
          }
        >
          <ValidateSubmission
            token={searchParams.token}
            submissionId={searchParams.submissionId}
          />
        </Suspense>
      </div>
    </main>
  );
}
