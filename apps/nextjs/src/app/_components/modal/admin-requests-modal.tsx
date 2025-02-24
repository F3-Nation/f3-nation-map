"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { closeModal } from "~/utils/store/modal";
import { DebouncedImage } from "../debounced-image";
import { VirtualizedCombobox } from "../virtualized-combobox";

export default function AdminRequestsModal({
  data: requestData,
}: {
  data: DataType[ModalType.ADMIN_REQUESTS];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: request } = api.request.byId.useQuery({ id: requestData.id });

  const form = useForm({
    schema: RequestInsertSchema.extend({
      badImage: z.boolean().default(false),
    }),
    defaultValues: {
      id: request?.id ?? uuid(),
    },
  });

  const formRegionId = form.watch("regionId");
  const formEventId = form.watch("eventId");
  const formId = form.watch("id");

  const utils = api.useUtils();
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: locationEvents } = api.location.getRegionAos.useQuery(
    { regionId: formRegionId ?? -1 },
    { enabled: formRegionId !== null },
  );
  const { data: eventTypes } = api.event.types.useQuery();
  const validateSubmissionByAdmin =
    api.request.validateSubmissionByAdmin.useMutation();
  const rejectSubmissionByAdmin = api.request.rejectSubmission.useMutation();

  useEffect(() => {
    if (!request) return;
    form.reset({
      id: request.id,
      eventId: request.eventId ?? -1,
      locationId: request.locationId ?? -1,
      eventName: request.eventName ?? "",
      // workoutWebsite: request.web ?? "",
      locationAddress: request.locationAddress ?? "",
      locationAddress2: request.locationAddress2 ?? "",
      locationCity: request.locationCity ?? "",
      locationState: request.locationState ?? "",
      locationZip: request.locationZip ?? "",
      locationCountry: request.locationCountry ?? "",
      locationLat: request.locationLat ?? 0,
      locationLng: request.locationLng ?? 0,
      eventStartTime: request.eventStartTime?.slice(0, 5) ?? "05:30",
      eventEndTime: request.eventEndTime?.slice(0, 5) ?? "06:15",
      eventDayOfWeek: request.eventDayOfWeek ?? "monday",
      eventTypeIds: request.eventTypeIds ?? [],
      eventDescription: request.eventDescription ?? "",
      regionId: request.regionId ?? -1,
      aoLogo: request.aoLogo ?? "",
      submittedBy: request.submittedBy ?? "",
    });
  }, [request, form, eventTypes]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true);
      console.log(values);
      await validateSubmissionByAdmin
        .mutateAsync({
          ...values,
        })
        .then(() => {
          void utils.event.invalidate();
          void utils.location.invalidate();
          void utils.request.invalidate();
          router.refresh();
          setIsSubmitting(false);
          toast.error("Approved update");
          closeModal();
        });
    },
    (error) => {
      toast.error("Failed to approve update");
      console.log(error);
    },
  );

  const onReject = async () => {
    setIsSubmitting(true);
    console.log("rejecting");
    await rejectSubmissionByAdmin
      .mutateAsync({
        id: formId,
      })
      .then(() => {
        void utils.request.invalidate();
        router.refresh();
        setIsSubmitting(false);
        toast.error("Rejected update");
        closeModal();
      });
  };

  if (!request) return <div>Loading...</div>;
  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:px-8"
      >
        {/* <DialogHeader>
          <DialogTitle className="text-center">Edit Request</DialogTitle>
        </DialogHeader> */}

        <Form {...form}>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                Edit Request
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
              {typeof request.eventId === "number" && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Event
                  </div>
                  <VirtualizedCombobox
                    // buttonClassName="w-full rounded-md py-3 font-normal"
                    // disabled if we got this from the data param
                    disabled={typeof request.eventId === "number"}
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
                            if (value) {
                              field.onChange(
                                eventTypes?.filter(
                                  (type) => type.id.toString() === value,
                                ),
                              );
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
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Latitude
                </div>
                <Input {...form.register("locationLat")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationLat?.message?.toString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Longitude
                </div>
                <Input {...form.register("locationLng")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationLng?.message?.toString()}
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
            <div className="mt-4 flex justify-between gap-2">
              <Button
                type="button"
                className="bg-foreground text-background hover:bg-foreground/80"
                onClick={() => onReject()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Rejecting... <Spinner className="size-4" />
                  </div>
                ) : (
                  "Reject"
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => closeModal()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-primary text-white hover:bg-primary/80"
                  onClick={() => onSubmit()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      Submitting... <Spinner className="size-4" />
                    </div>
                  ) : (
                    "Approve"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
