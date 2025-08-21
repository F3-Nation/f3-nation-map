import type { FieldErrors } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import gte from "lodash/gte";

import type { PartialBy } from "@acme/shared/common/types";
import type { UpdateLocationFormValues } from "@acme/validators";
import { validateRequest } from "@acme/api/lib/validate-request";
import { Z_INDEX } from "@acme/shared/app/constants";
import {
  convertHH_mmToHHmm,
  requestTypeToTitle,
} from "@acme/shared/app/functions";
import { isTruthy } from "@acme/shared/common/functions";
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

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { isProd } from "~/trpc/util";
import { vanillaApi } from "~/trpc/vanilla";
import { useUpdateForm } from "~/utils/forms";
import { appStore } from "~/utils/store/app";
import { closeModal } from "~/utils/store/modal";
import { DevLoadTestData, FormDebugData } from "../forms/dev-debug-component";
import { ContactDetailsForm } from "../forms/form-inputs/contact-details-form";
import { loadDataIntoUpdateForm } from "../forms/load-data-into-form";
import { RequestFormSelector } from "../forms/request-form-selector";

export const UpdateModal = (params: { data: DataType[ModalType.UPDATE] }) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useUpdateForm({
    defaultValues: {
      locationCountry: "United States",
    },
    mode: "onBlur",
  });

  const formRegionId = form.watch("regionId");
  const formOriginalRegionId = form.watch("originalRegionId");
  const orgIds = useMemo(
    () => [formRegionId, formOriginalRegionId].filter(isTruthy),
    [formRegionId, formOriginalRegionId],
  );
  const { data: canEditRegion } = api.request.canEditRegions.useQuery(
    { orgIds },
    { enabled: orgIds.length > 0 },
  );

  useEffect(() => {
    loadDataIntoUpdateForm(form, params.data);
  }, [params.data, form]);

  const handleSubmission = async (
    values: PartialBy<UpdateLocationFormValues, "badImage">,
  ) => {
    try {
      console.log("onSubmit values", values);
      setIsSubmitting(true);
      if (values.badImage && !!values.aoLogo) {
        form.setError("aoLogo", { message: "Invalid image URL" });
        throw new Error("Invalid image URL");
      }
      appStore.setState({ myEmail: values.submittedBy });

      // Validate the request on the frontend and set errors if there are zod validation errors

      const updateRequestData = {
        ...values,
        eventStartTime: values.eventStartTime
          ? convertHH_mmToHHmm(values.eventStartTime)
          : undefined,
        eventEndTime: values.eventEndTime
          ? convertHH_mmToHHmm(values.eventEndTime)
          : undefined,
        eventId: gte(values.eventId, 0) ? values.eventId ?? null : null,
      };

      const validatedValues = validateRequest(updateRequestData);

      const result =
        await vanillaApi.request.submitUpdateRequest.mutate(validatedValues);
      if (result.status === "pending") {
        toast.success(
          "Request submitted. An admin will review your submission soon.",
        );
      } else if (result.status === "rejected") {
        toast.error("Failed to submit update request");
        throw new Error("Failed to submit update request");
      } else if (result.status === "approved") {
        void utils.invalidate();
        toast.success("Update request automatically applied");
        router.refresh();
      }

      closeModal();
    } catch (error) {
      console.error(error);
      if (!(error instanceof Error)) {
        toast.error("Failed to submit update request");
        return;
      }

      if (!(error instanceof TRPCClientError)) {
        toast.error(error.message);
        return;
      }

      if (error.message.includes("End time must be after start time")) {
        form.setError("eventEndTime", {
          message: "End time must be after start time",
        });
        toast.error("End time must be after start time");
        throw new Error("End time must be after start time");
      } else {
        toast.error("Failed to submit update request");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {dataToTitle(params.data)}
                {!isProd && <FormDebugData />}
              </DialogTitle>
            </DialogHeader>

            <RequestFormSelector requestType={params.data.requestType} />
            <ContactDetailsForm />

            <div className="pb-safe sticky bottom-0 -mx-[1px] mt-4 flex flex-col items-stretch justify-end gap-2 border-t border-border bg-background p-4 shadow-lg sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <Button
                type="button"
                className="w-full bg-blue-600 text-white hover:bg-blue-600/80 sm:w-auto"
                onClick={() => {
                  console.log("form.getValues()", form.getValues());
                  void form.handleSubmit(
                    handleSubmission,
                    handleSubmissionError,
                  )();
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Submitting... <Spinner className="size-4" />
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
              {canEditRegion?.every((result) => result.success) ? (
                <div className="mb-2 text-center text-xs text-destructive">
                  Since you can edit{" "}
                  {orgIds.length === 1 ? "this region" : "these regions"}, these
                  changes will be reflected immediately
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

const dataToTitle = (data: DataType[ModalType.UPDATE]) => {
  switch (data.requestType) {
    case "edit":
      if (data.eventId) {
        return "Edit Event Details";
      } else if (data.aoId) {
        return "Edit AO Details";
      } else if (data.locationId) {
        return "Edit Location Details";
      }
      throw new Error("Invalid request type");
    default:
      return requestTypeToTitle(data.requestType);
  }
};
