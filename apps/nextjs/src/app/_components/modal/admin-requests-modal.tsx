"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import { Controller } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { Z_INDEX } from "@acme/shared/app/constants";
import { DayOfWeek } from "@acme/shared/app/enums";
import { Case } from "@acme/shared/common/enums";
import { convertCase } from "@acme/shared/common/functions";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Form, useForm } from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  ControlledSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Spinner } from "@acme/ui/spinner";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { RequestInsertSchema } from "@acme/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { scaleAndCropImage } from "~/utils/image/scale-and-crop-image";
import { uploadLogo } from "~/utils/image/upload-logo";
import { closeModal } from "~/utils/store/modal";
import { DebouncedImage } from "../debounced-image";
import { VirtualizedCombobox } from "../virtualized-combobox";
import { CountrySelect } from "./country-select";

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

  const formId = form.watch("id");
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");
  const formEventId = form.watch("eventId");

  const utils = api.useUtils();
  const { data: regions } = api.location.getRegions.useQuery();
  const { data: locations } = api.location.all.useQuery();
  const { data: eventTypes } = api.event.types.useQuery();

  const sortedLocationOptions = useMemo(() => {
    return locations
      ?.map(({ name, id, events, regionName, regionId }) => ({
        label: `${name || events.map((e) => e.name).join(", ")} ${
          regionName ? `(${regionName})` : ""
        }`,
        value: id.toString(),
        regionId,
      }))
      ?.sort((a, b) =>
        a.regionId === formRegionId && b.regionId !== formRegionId
          ? -1
          : a.regionId !== formRegionId && b.regionId === formRegionId
            ? 1
            : a.label.localeCompare(b.label),
      );
  }, [locations, formRegionId]);

  const validateSubmissionByAdmin =
    api.request.validateSubmissionByAdmin.useMutation();
  const rejectSubmissionByAdmin = api.request.rejectSubmission.useMutation();

  const onSubmit = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true);
      console.log(values);
      await validateSubmissionByAdmin
        .mutateAsync(values)
        .then(() => {
          void utils.event.invalidate();
          void utils.location.invalidate();
          void utils.request.invalidate();
          router.refresh();
          toast.success("Approved update");
          closeModal();
        })
        .catch((error) => {
          if (error instanceof TRPCClientError) {
            toast.error(error.message);
          } else {
            toast.error("Failed to approve update");
          }
        })
        .finally(() => {
          setIsSubmitting(false);
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

  useEffect(() => {
    if (!request) return;
    form.reset({
      id: request.id,
      requestType: request.requestType,
      eventId: request.eventId ?? null,
      locationId: request.locationId ?? null,
      eventName: request.eventName ?? "",
      // workoutWebsite: request.web ?? "",
      locationName: request.locationName ?? "",
      locationAddress: request.locationAddress ?? "",
      locationAddress2: request.locationAddress2 ?? "",
      locationCity: request.locationCity ?? "",
      locationState: request.locationState ?? "",
      locationZip: request.locationZip ?? "",
      locationCountry: request.locationCountry ?? "",
      locationLat: request.locationLat ?? 0,
      locationLng: request.locationLng ?? 0,
      locationDescription: request.locationDescription ?? "",
      eventStartTime: request.eventStartTime?.slice(0, 5) ?? "05:30",
      eventEndTime: request.eventEndTime?.slice(0, 5) ?? "06:15",
      eventDayOfWeek: request.eventDayOfWeek ?? "monday",
      eventTypeIds: request.eventTypeIds ?? [],
      eventDescription: request.eventDescription ?? "",
      regionId: request.regionId ?? null,
      aoLogo: request.aoLogo ?? "",
      submittedBy: request.submittedBy ?? "",
    });
  }, [request, form, eventTypes]);

  if (!request) return <div>Loading...</div>;
  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:px-8"
      >
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold sm:text-4xl">
                Edit Request
                <p className="text-sm text-muted-foreground">
                  Form ID: {formId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Event ID: {formEventId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Location ID: {formLocationId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Region ID: {formRegionId}
                </p>
              </DialogTitle>
            </DialogHeader>
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
                  options={DayOfWeek.map((day) => ({
                    value: day,
                    label: convertCase({
                      str: day,
                      fromCase: Case.LowerCase,
                      toCase: Case.TitleCase,
                    }),
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
                      <div>
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
                        {fieldState.error && (
                          <p className="text-xs text-destructive">
                            You must select at least one event type
                          </p>
                        )}
                      </div>
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
            <div className="mb-3">
              <VirtualizedCombobox
                key={formLocationId?.toString()}
                options={sortedLocationOptions ?? []}
                value={formLocationId?.toString()}
                onSelect={(item) => {
                  const location = locations?.find(
                    ({ id }) => id.toString() === item,
                  );
                  form.setValue("locationId", location?.id ?? null);
                  if (!location) return;
                  form.setValue("locationName", location.name);
                  form.setValue(
                    "locationDescription",
                    location.description ?? "",
                  );
                  form.setValue("locationAddress", location.addressStreet);
                  form.setValue("locationAddress2", location.addressStreet2);
                  form.setValue("locationCity", location.addressCity);
                  form.setValue("locationState", location.addressState);
                  form.setValue("locationZip", location.addressZip);
                  form.setValue("locationCountry", location.addressCountry);
                  form.setValue("locationLat", location.latitude);
                  form.setValue("locationLng", location.longitude);
                  if (location?.regionId == undefined) {
                    // @ts-expect-error -- must remove regionId from form
                    form.setValue("regionId", null);
                  } else {
                    form.setValue("regionId", location?.regionId);
                  }
                }}
                searchPlaceholder="Select"
              />
              <div className="mx-3 text-xs text-muted-foreground">
                Select a location above to move this workout to a different
                location
              </div>
            </div>
            <div className="my-2 text-base font-bold text-foreground">
              The fields below update the AO for all associated workouts
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Name
                </div>
                <Input {...form.register("locationName")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationName?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Description
                </div>
                <Textarea {...form.register("locationDescription")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationDescription?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Address
                </div>
                <Input {...form.register("locationAddress")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationAddress?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Address 2
                </div>
                <Input {...form.register("locationAddress2")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationAddress2?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location City
                </div>
                <Input {...form.register("locationCity")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationCity?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location State
                </div>
                <Input {...form.register("locationState")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationState?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Zip
                </div>
                <Input {...form.register("locationZip")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationZip?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Country
                </div>
                <CountrySelect control={form.control} name="locationCountry" />
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
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Region
                </div>
                <VirtualizedCombobox
                  key={formRegionId?.toString()}
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
