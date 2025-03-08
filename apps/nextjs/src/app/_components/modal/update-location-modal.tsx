/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import gte from "lodash/gte";
import { useSession } from "next-auth/react";
import { Controller } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { Z_INDEX } from "@acme/shared/app/constants";
import { DayOfWeek } from "@acme/shared/app/enums";
import { Case } from "@acme/shared/common/enums";
import { convertCase, isTruthy } from "@acme/shared/common/functions";
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
import { isDevMode } from "~/trpc/util";
import { scaleAndCropImage } from "~/utils/image/scale-and-crop-image";
import { uploadLogo } from "~/utils/image/upload-logo";
import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import { closeModal } from "~/utils/store/modal";
import { DebouncedImage } from "../debounced-image";
import { VirtualizedCombobox } from "../virtualized-combobox";
import { CountrySelect } from "./country-select";

export const UpdateLocationModal = ({
  data,
}: {
  data: DataType[ModalType.UPDATE_LOCATION];
}) => {
  const router = useRouter();
  const { data: canEditRegion } = api.request.canEditRegion.useQuery(
    { orgId: data.regionId ?? -1 },
    { enabled: !!data.regionId },
  );
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: submitUpdateRequest } =
    api.request.submitUpdateRequest.useMutation();

  const form = useForm({
    schema: RequestInsertSchema.extend({
      badImage: z.boolean().default(false),
    }),
    defaultValues: {
      locationCountry: "United States",
    },
    mode: "onBlur",
  });

  // Get data information
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");
  const formEventId = form.watch("eventId");
  const formId = form.watch("id");

  const { data: session } = useSession();
  const isAdmin = session?.roles.some(
    (role) => role.roleName === "admin" && role.orgId === formRegionId,
  );

  // Get form values
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
    if (data.regionId != undefined) {
      form.setValue("regionId", data.regionId);
    } else {
      // @ts-expect-error -- must remove regionId from form
      form.setValue("regionId", null);
    }

    form.setValue("locationId", data.locationId ?? null);
    form.setValue("locationName", data.locationName ?? "");
    form.setValue("locationAddress", data.locationAddress ?? "");
    form.setValue("locationAddress2", data.locationAddress2 ?? "");
    form.setValue("locationCity", data.locationCity ?? "");
    form.setValue("locationState", data.locationState ?? "");
    form.setValue("locationZip", data.locationZip ?? "");
    form.setValue("locationCountry", data.locationCountry ?? "");
    form.setValue("locationLat", data.lat);
    form.setValue("locationLng", data.lng);
    form.setValue("locationDescription", data.locationDescription ?? "");

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
                <p className="text-sm text-muted-foreground">
                  Form ID: {formId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Form Region ID: {formRegionId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Form Location ID: {formLocationId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Form Event ID: {formEventId}
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
                <Input {...form.register("eventName")} />
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
                <Textarea
                  {...form.register("eventDescription")}
                  placeholder="Tell people if there's anything they need to know prior to showing up to the workout"
                />
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
                  // We need to keep the lat lng when the marker has been moved
                  const possiblyUpdatedLocation = mapStore.get(
                    "modifiedLocationMarkers",
                  )[location.id];
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
                  form.setValue(
                    "locationLat",
                    possiblyUpdatedLocation?.lat ?? location.latitude,
                  );
                  form.setValue(
                    "locationLng",
                    possiblyUpdatedLocation?.lon ?? location.longitude,
                  );
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
                    if (region) {
                      form.setValue("regionId", region.id);
                    }
                  }}
                  searchPlaceholder="Select"
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.regionId?.message}
                </p>
              </div>
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
                <Textarea
                  {...form.register("locationDescription")}
                  placeholder="Help people unfamiliar with the area find you"
                />
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
                  {form.formState.errors.locationLat?.message}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Location Longitude
                </div>
                <Input {...form.register("locationLng")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.locationLng?.message}
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
                <Input {...form.register("submittedBy")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.submittedBy?.message}
                </p>
              </div>
            </div>
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
              {isDevMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const values = form.getValues();
                    !values.eventName &&
                      form.setValue("eventName", "Test Event");
                    !values.eventDayOfWeek &&
                      form.setValue("eventDayOfWeek", "monday");
                    !values.submittedBy &&
                      form.setValue("submittedBy", "test@test.com");
                    !values.aoLogo &&
                      form.setValue("aoLogo", "https://placehold.co/640x640");
                    !values.locationName &&
                      form.setValue("locationName", "Test Location");
                    !values.locationAddress &&
                      form.setValue("locationAddress", "123 Test St");
                    !values.locationAddress2 &&
                      form.setValue("locationAddress2", "Apt 1");
                    !values.locationCity &&
                      form.setValue("locationCity", "Test City");
                    !values.locationState &&
                      form.setValue("locationState", "CA");
                    !values.locationZip &&
                      form.setValue("locationZip", "12345");
                    !values.locationCountry &&
                      form.setValue("locationCountry", "United States");
                    !values.eventTypeIds?.length &&
                      form.setValue("eventTypeIds", [1]);
                    !values.eventStartTime &&
                      form.setValue("eventStartTime", "0900");
                    !values.eventEndTime &&
                      form.setValue("eventEndTime", "1000");
                    !values.eventDescription &&
                      form.setValue("eventDescription", "Test Description");
                  }}
                >
                  (DEV) Load Test Data
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
