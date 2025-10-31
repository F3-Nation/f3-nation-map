import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { PartialBy } from "@acme/shared/common/types";
import type { UpdateLocationFormValues } from "@acme/validators";
import { validateMoveAOToNewLocationRequest } from "@acme/api/lib/validate-request";
import { Button } from "@acme/ui/button";
import { Form } from "@acme/ui/form";
import { Spinner } from "@acme/ui/spinner";
import { toast } from "@acme/ui/toast";

import type { DataType, ModalType } from "~/utils/store/modal";
import {
  DevLoadTestData,
  FormDebugData,
} from "~/app/_components/forms/dev-debug-component";
import { ContactDetailsForm } from "~/app/_components/forms/form-inputs/contact-details-form";
import { loadDataIntoMoveAOToNewLocationForm } from "~/app/_components/forms/load-data-into-form";
import { RequestFormSelector } from "~/app/_components/forms/request-form-selector";
import { BaseModal } from "~/app/_components/modal/base-modal";
import { handleSubmissionError } from "~/app/_components/modal/utils/handle-submission-error";
import { api } from "~/trpc/react";
import { isProd } from "~/trpc/util";
import { vanillaApi } from "~/trpc/vanilla";
import { useUpdateForm } from "~/utils/forms";
import { appStore } from "~/utils/store/app";
import { closeModal } from "~/utils/store/modal";

export const MoveAOToNewLocationModal = ({
  data,
}: {
  data: DataType[ModalType.MOVE_AO_TO_NEW_LOCATION];
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
    // Load move AO to new location data into form
    if (data) {
      loadDataIntoMoveAOToNewLocationForm(form, data);
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
        requestType: "move_ao_to_new_location" as const,
      };

      const validatedValues =
        validateMoveAOToNewLocationRequest(updateRequestData);

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
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal title="Move AO to New Location">
      <Form {...form}>
        <form
          className="w-[inherit] overflow-x-hidden p-[1px]"
          onSubmit={form.handleSubmit(handleSubmission, handleSubmissionError)}
        >
          {!isProd && <FormDebugData />}

          <RequestFormSelector requestType="move_ao_to_new_location" />
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
                "Move AO to New Location"
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
    </BaseModal>
  );
};
