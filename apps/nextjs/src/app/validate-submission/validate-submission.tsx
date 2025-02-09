import { api } from "~/trpc/server";

interface ValidateSubmissionProps {
  token: string;
  submissionId: string;
}

export async function ValidateSubmission({
  token,
  submissionId,
}: ValidateSubmissionProps) {
  let result: { success: boolean } | null = null;

  try {
    result = await api.request.validateSubmission({
      token,
      submissionId,
    });
  } catch (error) {
    console.error(error);
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Submission Validated!</h2>
        <p className="text-muted-foreground">
          Thank you for verifying your submission. Your report has been
          confirmed.
        </p>
        <a
          href="/"
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-600/80"
        >
          Return to the Map
        </a>
      </div>
    );
  }

  // Show error content for both null result and unsuccessful validation
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-yellow-100 p-3">
        <svg
          className="h-6 w-6 text-yellow-600"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">Invalid Validation</h2>
      <p className="text-muted-foreground">
        We couldn't validate this submission. The link may have expired or been
        already used.
      </p>
      <a
        href="/"
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-600/80"
      >
        Return to the Map
      </a>
    </div>
  );
}
