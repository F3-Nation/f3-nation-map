/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gte from "lodash/gte";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";

import { Z_INDEX } from "@acme/shared/app/constants";
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
import { isDevMode } from "~/trpc/util";
import { useUpdateLocationForm } from "~/utils/forms";
import { appStore } from "~/utils/store/app";
import { closeModal } from "~/utils/store/modal";
import {
  DevLoadTestData,
  FormDebugData,
  LocationEventForm,
} from "../forms/location-event-form";

export const UpdateLocationModal = ({
  data,
}: {
  data: DataType[ModalType.UPDATE_LOCATION];
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: submitUpdateRequest } =
    api.request.submitUpdateRequest.useMutation();

  const form = useUpdateLocationForm({
    defaultValues: {
      locationCountry: "United States",
    },
    mode: "onBlur",
  });

  const formRegionId = form.watch("regionId");
  const { data: canEditRegion } = api.request.canEditRegion.useQuery(
    { orgId: formRegionId },
    { enabled: !!formRegionId && formRegionId !== -1 },
  );

  const { data: session } = useSession();
  const { data: eventTypes } = api.event.types.useQuery();

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        console.log("onSubmit values", values);
        if (values.badImage && !!values.aoLogo) {
          form.setError("aoLogo", { message: "Invalid image URL" });
          return;
        }
        setIsSubmitting(true);
        appStore.setState({ myEmail: values.submittedBy });
        const updateRequestData = {
          ...values,
          eventId: gte(data.eventId, 0) ? data.eventId ?? null : null,
        };

        await submitUpdateRequest(updateRequestData).then((result) => {
          if (result.status === "pending") {
            toast.success(
              "Request submitted. An admin will review your submission soon.",
            );
          } else if (result.status === "rejected") {
            toast.error("Failed to submit update request");
          } else if (result.status === "approved") {
            void utils.location.invalidate();
            void utils.event.invalidate();
            toast.success("Update request automatically applied");
            router.refresh();
          }
        });

        setIsSubmitting(false);
        closeModal();
      } catch (error) {
        console.error("Error submitting update request", error);
        toast.error("Failed to submit update request");
        setIsSubmitting(false);
      }
    },
    (errors) => {
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
    },
  );

  useEffect(() => {
    form.setValue("id", uuid());
    form.setValue("requestType", data.requestType);
    if (data.regionId != null && data.regionId !== -1) {
      form.setValue("regionId", data.regionId);
    } else {
      // @ts-expect-error -- must remove regionId from form
      form.setValue("regionId", null);
    }

    form.setValue("locationId", data.locationId ?? null);
    form.setValue("locationAddress", data.locationAddress ?? "");
    form.setValue("locationAddress2", data.locationAddress2 ?? "");
    form.setValue("locationCity", data.locationCity ?? "");
    form.setValue("locationState", data.locationState ?? "");
    form.setValue("locationZip", data.locationZip ?? "");
    form.setValue("locationCountry", data.locationCountry ?? "");
    form.setValue("locationLat", data.lat);
    form.setValue("locationLng", data.lng);
    form.setValue("locationDescription", data.locationDescription ?? "");

    form.setValue("aoName", data.aoName ?? "");
    form.setValue("aoLogo", data.aoLogo ?? "");

    form.setValue("eventId", data.eventId ?? null);
    form.setValue("eventName", data.workoutName ?? "");
    form.setValue("eventStartTime", data.startTime?.slice(0, 5) ?? "0530");
    form.setValue("eventEndTime", data.endTime?.slice(0, 5) ?? "0615");
    form.setValue("eventDescription", data.eventDescription ?? "");
    if (data.dayOfWeek) {
      form.setValue("eventDayOfWeek", data.dayOfWeek);
    } else {
      // @ts-expect-error -- must remove dayOfWeek from form
      form.setValue("eventDayOfWeek", null);
    }
    form.setValue(
      "eventTypeIds",
      data.types
        ?.map((type) => eventTypes?.find((t) => t.name === type)?.id)
        .filter(isTruthy) ?? [],
    );
    form.setValue("eventDescription", data.eventDescription ?? "");

    form.setValue("submittedBy", session?.email || appStore.get("myEmail"));
  }, [data, eventTypes, form, session?.email]);

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
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                {data.requestType === "edit"
                  ? "Edit Event"
                  : data.requestType === "create_location"
                    ? "New Location"
                    : "New Event"}
                {isDevMode && <FormDebugData />}
              </DialogTitle>
            </DialogHeader>

            <LocationEventForm />

            <div className="mt-4 flex flex-col items-stretch justify-end gap-2">
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-600/80"
                onClick={() => onSubmit()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Submitting... <Spinner className="size-4" />
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
              {canEditRegion ? (
                <div className="mb-2 text-center text-xs text-destructive">
                  Since you can edit this region, these changes will be
                  reflected immediately
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              {isDevMode && <DevLoadTestData />}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
