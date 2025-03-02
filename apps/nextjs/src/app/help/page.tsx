import { Suspense } from "react";

import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { Header } from "./header";
import { SubmitBugReportCard } from "./submit-bug-report-card";

export default async function HelpPage() {
  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <main className="pointer-events-auto relative max-h-screen gap-4 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-[3%] py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        <div>
          Welcome to Nation Map's support portal. We're committed to
          continuously improving the map and appreciate your feedback about any
          issues you encounter or ideas you have for improvements
        </div>
        <SubmitBugReportCard />
        <div>
          Your report will be reviewed as soon as possible. If you've left your
          email we'll try to reach out to you.
        </div>
      </div>
    </main>
  );
}
