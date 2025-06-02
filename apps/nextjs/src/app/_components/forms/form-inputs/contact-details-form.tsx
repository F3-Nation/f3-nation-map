import { Input } from "@acme/ui/input";

import { useUpdateFormContext } from "~/utils/forms";

export const ContactDetailsForm = () => {
  const form = useUpdateFormContext();

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        Contact Information:
      </h2>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Your Email
        </div>
        <Input
          {...form.register("submittedBy")}
          placeholder="your.email@example.com"
        />
        <p className="text-xs text-muted-foreground">
          We will send you a confirmation email when your update request is
          approved.
        </p>
        <p className="text-xs text-destructive">
          {form.formState.errors.submittedBy?.message?.toString()}
        </p>
      </div>
    </>
  );
};

export const DeleteConfirmation = ({ type }: { type: "event" | "ao" }) => {
  return (
    <div className="my-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Attention Required
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            {type === "event" ? (
              <p>
                You are about to request deletion of an event. This action
                cannot be undone. Please confirm you want to proceed with this
                deletion request.
              </p>
            ) : (
              <p>
                You are about to request deletion of an AO. This will delete the
                AO, all its workouts, and possibly the location if no other
                events exist there. This action cannot be undone. Please confirm
                you want to proceed with this deletion request.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
