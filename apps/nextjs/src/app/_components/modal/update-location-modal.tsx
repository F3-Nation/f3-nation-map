import { useEffect, useState } from "react";
import gte from "lodash/gte";
import { useSession } from "next-auth/react";
import { Controller } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { DAY_ORDER, Z_INDEX } from "@f3/shared/app/constants";
import { Button } from "@f3/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import { Form, useForm } from "@f3/ui/form";
import { Input } from "@f3/ui/input";
import {
  ControlledSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@f3/ui/select";
import { Spinner } from "@f3/ui/spinner";
import { Textarea } from "@f3/ui/textarea";
import { toast } from "@f3/ui/toast";
import { RequestInsertSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { scaleAndCropImage } from "~/utils/image/scale-and-crop-image";
import { uploadLogo } from "~/utils/image/upload-logo";
import { appStore } from "~/utils/store/app";
import { closeModal } from "~/utils/store/modal";
import { DebouncedImage } from "../debounced-image";
import { VirtualizedCombobox } from "../virtualized-combobox";

export const UpdateLocationModal = ({
  data,
}: {
  data: DataType[ModalType.UPDATE_LOCATION];
}) => {
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: submitUpdateRequest } =
    api.request.submitUpdateRequest.useMutation();
  const { mutateAsync: submitUpdateRequestAdmin } =
    api.request.validateSubmissionByAdmin.useMutation();

  const form = useForm({
    schema: RequestInsertSchema.extend({
      badImage: z.boolean().default(false),
    }),
    mode: "onBlur",
  });

  // Get data information
  const formRegionId = form.watch("regionId");
  const formEventId = form.watch("eventId");
  const formId = form.watch("id");

  const { data: session } = useSession();
  const isAdmin = session?.roles.some(
    (role) => role.roleName === "admin" && role.orgId === formRegionId,
  );
  const canEditRegion = session?.roles.some(
    (role) =>
      (role.roleName === "editor" || role.roleName === "admin") &&
      role.orgId === formRegionId,
  );

  const lat = data.lat;
  const lng = data.lng;
  const mode = data.mode;

  // Get form values
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: locationEvents } = api.location.getRegionAos.useQuery(
    { regionId: formRegionId ?? -1 },
    { enabled: formRegionId !== null && formRegionId !== -1 },
  );
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

        if (isAdmin) {
          await submitUpdateRequestAdmin(updateRequestData);
          toast.success("Map updated");
          void utils.location.invalidate();
          void utils.event.invalidate();
        } else {
          await submitUpdateRequest(updateRequestData);
          toast.success(
            "Request submitted. Please check your email to validate your submission.",
          );
        }

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
    form.reset({
      id: uuid(),
      regionId: data.regionId ?? -1,
      eventId: data.eventId ?? -1,
      locationId: data.locationId ?? -1,
      eventName: data.workoutName ?? "",
      aoLogo: data.aoLogo ?? "",
      locationName: data.locationName ?? "",
      locationAddress: data.locationAddress ?? "",
      locationAddress2: data.locationAddress2 ?? "",
      locationCity: data.locationCity ?? "",
      locationState: data.locationState ?? "",
      locationZip: data.locationZip ?? "",
      locationCountry: data.locationCountry ?? "",
      locationLat: data.lat ?? 0,
      locationLng: data.lng ?? 0,
      eventStartTime: data.startTime?.slice(0, 5) ?? "05:30",
      eventEndTime: data.endTime?.slice(0, 5) ?? "06:15",
      eventDayOfWeek: data.dayOfWeek,
      eventTypeIds: data.types?.map((type) => type.id) ?? [],
      eventDescription: data.eventDescription ?? "",
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      submittedBy: session?.email || appStore.get("myEmail"),
    });
  }, [data, form, session?.email]);

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
          <form onSubmit={onSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                {mode === "edit-event"
                  ? "Edit Event"
                  : mode === "new-location"
                    ? "New Location"
                    : "New Event"}
                <p className="text-sm text-muted-foreground">
                  {lat?.toFixed(5)}, {lng?.toFixed(5)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Form ID: {formId}
                </p>
              </DialogTitle>
            </DialogHeader>

            <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
              Update Existing Event:
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Region
                </div>
                <VirtualizedCombobox
                  // buttonClassName="w-full rounded-md py-3 font-normal"
                  // hideSearchIcon
                  key={formRegionId?.toString()}
                  // disabled if we got this from the data param
                  options={
                    regions
                      ?.map((region) => ({
                        label: region.name,
                        value: region.id.toString(),
                      }))
                      .sort((a, b) => a.label.localeCompare(b.label)) ?? []
                  }
                  value={formRegionId?.toString()}
                  onSelect={(item) => {
                    const region = regions?.find(
                      (region) => region.id.toString() === item,
                    );
                    form.setValue("regionId", region?.id ?? -1);
                  }}
                  searchPlaceholder="Select"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.regionId?.message}
                </p>
              </div>
              {typeof data.eventId === "number" && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Event
                  </div>
                  <VirtualizedCombobox
                    // buttonClassName="w-full rounded-md py-3 font-normal"
                    // disabled if we got this from the data param
                    disabled={typeof data.eventId === "number"}
                    // hideSearchIcon
                    key={formEventId?.toString()}
                    options={[
                      {
                        label: "New event",
                        value: "-1",
                      },
                      ...(locationEvents
                        ?.map((location) => ({
                          label: location.events.name,
                          value: location.events.id.toString(),
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)) ?? []),
                    ]}
                    value={formEventId?.toString()}
                    onSelect={(item) => {
                      const location = locationEvents?.find(
                        (location) => location.events.id.toString() === item,
                      );
                      form.setValue("eventId", location?.events.id ?? -1);
                    }}
                    searchPlaceholder={
                      !formRegionId
                        ? "Select a region first"
                        : locationEvents?.length === 0
                          ? "No events found"
                          : "Select"
                    }
                  />
                </div>
              )}
            </div>
            <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
              Event Details:
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Workout Name
                </div>
                <Input
                  {...form.register("eventName")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventName?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Day of Week
                </div>
                <ControlledSelect
                  control={form.control}
                  name="eventDayOfWeek"
                  options={DAY_ORDER.map((day) => ({
                    label: day,
                    value: day,
                  }))}
                  placeholder="Select a day of the week"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventDayOfWeek?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Start Time (24hr format)
                </div>
                <Input {...form.register("eventStartTime")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventStartTime?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  End Time (24hr format)
                </div>
                <Input {...form.register("eventEndTime")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventEndTime?.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Event Type
                </div>
                <Controller
                  control={form.control}
                  name="eventTypeIds"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        <Select
                          value={field.value?.[0]?.toString()}
                          onValueChange={(value) => {
                            console.log("value", value);
                            if (value) {
                              field.onChange([Number(value)]);
                            }
                          }}
                        >
                          <SelectTrigger
                            id={`eventTypes`}
                            aria-label="Event Type"
                          >
                            <SelectValue placeholder="Select an event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes?.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-destructive">
                          {fieldState.error?.message}
                        </p>
                      </>
                    );
                  }}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Event Description
                </div>
                <Textarea {...form.register("eventDescription")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.eventDescription?.message}
                </p>
              </div>
            </div>
            <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
              Location Details:
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Name
                </div>
                <Input
                  {...form.register("locationName")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationName?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Address
                </div>
                <Input
                  {...form.register("locationAddress")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationAddress?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Address 2
                </div>
                <Input
                  {...form.register("locationAddress2")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationAddress2?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location City
                </div>
                <Input
                  {...form.register("locationCity")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationCity?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location State
                </div>
                <Input
                  {...form.register("locationState")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationState?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Zip
                </div>
                <Input
                  {...form.register("locationZip")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationZip?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Country
                </div>
                <Input {...form.register("locationCountry")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationCountry?.message}
                </p>
              </div>
            </div>
            <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
              Other Details:
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  AO Logo
                </div>
                <Controller
                  control={form.control}
                  name="aoLogo"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            console.log("files", e.target.files);
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const blob640 = await scaleAndCropImage(
                              file,
                              640,
                              640,
                            );
                            if (!blob640) return;
                            const url640 = await uploadLogo({
                              file: blob640,
                              regionId: formRegionId,
                              requestId: formId,
                            });
                            onChange(url640);
                            const blob64 = await scaleAndCropImage(
                              file,
                              64,
                              64,
                            );
                            if (blob64) {
                              void uploadLogo({
                                file: blob64,
                                regionId: formRegionId,
                                requestId: formId,
                                size: 64,
                              });
                            }
                          }}
                          disabled={formRegionId <= -1 || formRegionId === null}
                          className="flex-1"
                        />
                        {value && (
                          <DebouncedImage
                            src={value}
                            alt="AO Logo"
                            onImageFail={() => form.setValue("badImage", true)}
                            onImageSuccess={() =>
                              form.setValue("badImage", false)
                            }
                          />
                        )}
                      </div>
                    );
                  }}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.aoLogo?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Submitter Email
                </div>
                <Input
                  {...form.register("submittedBy")}
                  disabled={formRegionId === null}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.submittedBy?.message}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch justify-end gap-2">
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
                <div className="mb-2 text-center text-xs text-muted-foreground">
                  Since you can edit this region, these changes will be
                  reflected immediately
                </div>
              ) : isAdmin ? (
                <div className="mb-2 text-center text-xs text-muted-foreground">
                  Since you're an admin, these changes will be reflected
                  immediately
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
