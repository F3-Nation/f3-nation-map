import type { FieldErrors } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";

import type { PartialBy } from "@acme/shared/common/types";
import type { UpdateLocationFormValues } from "@acme/validators";
import { validateCreateLocationAndEventRequest } from "@acme/api/lib/validate-request";
import { Z_INDEX } from "@acme/shared/app/constants";
import { convertHH_mmToHHmm } from "@acme/shared/app/functions";
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
import { loadDataIntoCreateLocationAndEventForm } from "../forms/load-data-into-form";
import { CreateLocationAndAOAndEventForm } from "../forms/request-forms/create-location-and-ao-and-event-form";

export const CreateLocationAndEventModal = ({
  data,
}: {
  data: DataType[ModalType.CREATE_LOCATION_AND_EVENT];
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useUpdateForm({
    defaultValues: {
      locationCountry: "United States",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    // Load location and event creation data into form
    if (data) {
      loadDataIntoCreateLocationAndEventForm(form, data);
    }
  }, [data, form]);

  const handleSubmission = async (
    values: PartialBy<UpdateLocationFormValues, "badImage">,
  ) => {
    try {
      console.log("onSubmit values", values);
      setIsSubmitting(true);

      appStore.setState({ myEmail: values.submittedBy });

      const updateRequestData = {
        ...values,
        requestType: "create_location_and_event" as const,
        eventStartTime: values.eventStartTime
          ? convertHH_mmToHHmm(values.eventStartTime)
          : undefined,
        eventEndTime: values.eventEndTime
          ? convertHH_mmToHHmm(values.eventEndTime)
          : undefined,
      };
      console.log("updateRequestData", updateRequestData);

      const validatedValues =
        validateCreateLocationAndEventRequest(updateRequestData);

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

      toast.error("Failed to submit update request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: need to update this to handle the new request types
  const handleSubmissionError = (
    errors: FieldErrors<UpdateLocationFormValues>,
  ) => {
    console.error("Form validation errors:", errors);
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
          <form
            className="w-[inherit] overflow-x-hidden p-[1px]"
            onSubmit={form.handleSubmit(
              handleSubmission,
              handleSubmissionError,
            )}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                Create New Location, AO & Event
                {!isProd && <FormDebugData />}
              </DialogTitle>
            </DialogHeader>

            <CreateLocationAndAOAndEventForm />
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
                  "Create Location, AO & Event"
                )}
              </Button>

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
