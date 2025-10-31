import type { FieldErrors } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import gte from "lodash/gte";

import { Z_INDEX } from "@acme/shared/app/constants";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Form } from "@acme/ui/form";
import { Spinner } from "@acme/ui/spinner";
import { toast } from "@acme/ui/toast";

import type { DeleteFormValues, useUpdateForm } from "~/utils/forms";
import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { isProd } from "~/trpc/util";
import { vanillaApi } from "~/trpc/vanilla";
import { useDeleteForm } from "~/utils/forms";
import { appStore } from "~/utils/store/app";
import { closeModal } from "~/utils/store/modal";
import { DevLoadTestData, FormDebugData } from "../forms/dev-debug-component";
import { ContactDetailsForm } from "../forms/form-inputs/contact-details-form";
import { loadDataIntoDeleteForm } from "../forms/load-data-into-form";
import { RequestFormSelector } from "../forms/request-form-selector";

export const DeleteModal = ({ data }: { data: DataType[ModalType.DELETE] }) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useDeleteForm({
    mode: "onBlur",
  });

  const formOriginalRegionId = form.watch("originalRegionId");
  const { data: canEditRegion } = api.request.canEditRegions.useQuery(
    { orgIds: [formOriginalRegionId] },
    { enabled: !!formOriginalRegionId && formOriginalRegionId !== -1 },
  );

  const handleSubmission = async (values: DeleteFormValues) => {
    try {
      console.log("onSubmit values", values);
      setIsSubmitting(true);
      appStore.setState({ myEmail: values.submittedBy });

      const deleteRequestData = {
        ...values,
        eventId: gte(data.eventId, 0) ? data.eventId ?? null : null,
      };

      const result =
        await vanillaApi.request.submitDeleteRequest.mutate(deleteRequestData);
      if (result.status === "pending") {
        toast.success(
          "Delete request submitted. An admin will review your submission soon.",
        );
      } else if (result.status === "rejected") {
        toast.error("Failed to submit delete request");
        throw new Error("Failed to submit delete request");
      } else if (result.status === "approved") {
        void utils.invalidate();
        toast.success("Delete request automatically applied");
        router.refresh();
      }

      closeModal();
    } catch (error) {
      console.error(error);
      if (!(error instanceof Error)) {
        toast.error("Failed to submit delete request");
        return;
      }

      if (!(error instanceof TRPCClientError)) {
        toast.error(error.message);
        return;
      }

      toast.error("Failed to submit delete request");
    } finally {
      setIsSubmitting(false);
    }
  };
  // handleSubmissionError
  // );

  useEffect(() => {
    loadDataIntoDeleteForm(form, data);
  }, [data, form]);

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        closeModal();
      }}
    >
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:px-8"
      >
        <Form {...form}>
          {/* Need 1px padding to prevent clipping of text boxes */}
          <form
            className="w-[inherit] overflow-x-hidden p-[1px]"
            onSubmit={form.handleSubmit(
              handleSubmission,
              handleSubmissionError,
            )}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                {dataToTitle(data)}
                {!isProd && <FormDebugData />}
              </DialogTitle>
            </DialogHeader>

            <RequestFormSelector requestType={data.requestType} />
            <ContactDetailsForm />

            <div className="pb-safe sticky bottom-0 -mx-[1px] mt-4 flex flex-col items-stretch justify-end gap-2 border-t border-border bg-background p-4 shadow-lg sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <Button
                type="button"
                className="w-full bg-destructive text-white hover:bg-destructive/80 sm:w-auto"
                onClick={() =>
                  form.handleSubmit(handleSubmission, handleSubmissionError)()
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Deleting... <Spinner className="size-4" />
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
              {canEditRegion?.every((result) => result.success) ? (
                <div className="mb-2 text-center text-xs text-destructive">
                  Since you can edit this region, these changes will be
                  reflected immediately
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              {!isProd && <DevLoadTestData />}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const handleSubmissionError = (
  errors: FieldErrors<ReturnType<typeof useUpdateForm>>,
) => {
  // Get all error messages
  const errorMessages = Object.entries(errors as { message: string }[])
    .map(([field, error]) => {
      if (error?.message) {
        return `${field}: ${error.message}`;
      }
      return null;
    })
    .filter(Boolean);

  // Show a toast with the first error message, or a generic message if none found
  toast.error(
    <div>
      {errorMessages.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>,
  );
  console.log("Form validation errors:", errors);
};

const dataToTitle = (data: DataType[ModalType.DELETE]) => {
  switch (data.requestType) {
    case "delete_event":
      return "Delete Event";
    case "delete_ao":
      return "Delete AO";
    // case "delete_location":
    //   return "Delete Location";
    default:
      throw new Error("Invalid request type");
  }
};
