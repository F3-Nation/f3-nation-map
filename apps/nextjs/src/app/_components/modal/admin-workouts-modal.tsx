"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Z_INDEX } from "@acme/shared/app/constants";
import { DayOfWeek } from "@acme/shared/app/enums";
import { safeParseInt } from "@acme/shared/common/functions";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Spinner } from "@acme/ui/spinner";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { EventInsertSchema } from "@acme/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";
import { VirtualizedCombobox } from "../virtualized-combobox";

export default function AdminWorkoutsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_EVENTS];
}) {
  const utils = api.useUtils();
  const { data: regions } = api.region.all.useQuery();
  const { data: locations } = api.location.all.useQuery();
  const { data: aos } = api.ao.all.useQuery();
  const { data: event } = api.event.byId.useQuery({ id: data.id ?? -1 });
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({ schema: EventInsertSchema });

  useEffect(() => {
    form.reset({
      id: event?.id ?? undefined,
      name: event?.name ?? "",
      isActive: event?.isActive ?? true,
      description: event?.description ?? "",
      aoId: event?.aos[0]?.aoId,
      highlight: event?.highlight ?? true,
      isSeries: event?.isSeries ?? true,
      locationId: event?.locationId,
      dayOfWeek: event?.dayOfWeek,
      startTime: event?.startTime?.slice(0, 5) ?? "0530",
      endTime: event?.endTime?.slice(0, 5) ?? "0615",
      email: event?.email ?? null,
      regionId: event?.regions[0]?.regionId,
      startDate: event?.startDate,
    });
  }, [form, event]);

  const crupdateEvent = api.event.crupdate.useMutation({
    onSuccess: async () => {
      await utils.event.invalidate();
      closeModal();
      toast.success("Successfully updated event");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update events"
          : "Failed to update event",
      );
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[600px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                setIsSubmitting(true);
                try {
                  await crupdateEvent.mutateAsync(data);
                } catch (error) {
                  toast.error("Failed to update event");
                  console.error(error);
                } finally {
                  setIsSubmitting(false);
                }
              },
              (error) => {
                toast.error("Failed to update event");
                console.log(error);
                setIsSubmitting(false);
              },
            )}
            className="space-y-4"
          >
            <div className="flex flex-wrap">
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input placeholder="ID" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="regionId"
                  render={({ field }) => (
                    <FormItem key={`region-${field.value}`}>
                      <FormLabel>Region</FormLabel>
                      <VirtualizedCombobox
                        value={field.value?.toString()}
                        options={
                          regions?.map((region) => ({
                            value: region.id.toString(),
                            label: region.name,
                          })) ?? []
                        }
                        searchPlaceholder="Select a region"
                        onSelect={(value) => {
                          const orgId = safeParseInt(value as string);
                          if (orgId == null) {
                            toast.error("Invalid orgId");
                            return;
                          }
                          field.onChange(orgId);
                        }}
                        isMulti={false}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="aoId"
                  render={({ field }) => {
                    const filteredAOs = aos?.aos.filter(
                      (ao) => ao.parentId === form.watch("regionId"),
                    );
                    return (
                      <FormItem key={`ao-${field.value}`}>
                        <FormLabel>AO</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            const aoId = safeParseInt(value);
                            field.onChange(aoId);

                            const selectedAO = aos?.aos.find(
                              (ao) => ao.id === aoId,
                            );
                            if (!selectedAO) {
                              toast.error("Invalid AO");
                              return;
                            }
                            if (selectedAO.parentId != null) {
                              form.setValue("regionId", selectedAO.parentId);
                            }

                            const aoLocations = locations?.locations.filter(
                              (l) => l.aoId === aoId,
                            );

                            // If the current location's parentId is not the selected AO, then we need to update the location
                            const locationId = form.getValues("locationId");
                            if (
                              !aoLocations?.find((l) => l.id === locationId)
                            ) {
                              form.setValue(
                                "locationId",
                                aoLocations?.[0]?.id ?? null,
                              );
                            }
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredAOs
                              ?.slice()
                              .sort(
                                (a, b) =>
                                  a.name?.localeCompare(b.name ?? "") ?? 0,
                              )
                              .map((ao) => (
                                <SelectItem
                                  key={`ao-${ao.id}`}
                                  value={ao.id.toString()}
                                >
                                  {ao.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => {
                    const regionId = form.getValues("regionId");
                    const aoId = form.getValues("aoId");
                    const filteredLocations = locations?.locations.filter(
                      (location) =>
                        location.regionId === regionId &&
                        location.aoId === aoId,
                    );
                    return (
                      <FormItem key={`location-${field.value}`}>
                        <FormLabel>Location</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            console.log("locationId onValueChange", value);
                            field.onChange(Number(value));

                            const selectedLocation = locations?.locations.find(
                              (location) => location.id === Number(value),
                            );
                            if (selectedLocation?.aoId != null) {
                              form.setValue("aoId", selectedLocation.aoId);
                            }
                            if (selectedLocation?.regionId != null) {
                              form.setValue(
                                "regionId",
                                selectedLocation.regionId,
                              );
                            }
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredLocations
                              ?.slice()
                              .sort(
                                (a, b) =>
                                  a.aoName?.localeCompare(b.aoName ?? "") ?? 0,
                              )
                              .map((location) => (
                                <SelectItem
                                  key={`location-${location.id}`}
                                  value={location.id.toString()}
                                >
                                  {location.locationName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem key={`dayOfWeek-${field.value}`}>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day of week" />
                        </SelectTrigger>
                        <SelectContent>
                          {DayOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (24hr format)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start Time"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (24hr format)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="End Time"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start Date"
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-1/2 px-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          value &&
                          field.onChange(value === "true" ? true : false)
                        }
                        value={field.value === true ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-full px-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <Textarea {...field} value={field.value ?? ""} rows={5} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4 w-full px-2">
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => closeModal()}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full">
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        Saving... <Spinner className="size-4" />
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
