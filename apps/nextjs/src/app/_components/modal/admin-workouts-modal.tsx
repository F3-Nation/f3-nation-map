"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Z_INDEX } from "@f3/shared/app/constants";
import { DayOfWeek } from "@f3/shared/app/enums";
import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@f3/ui/form";
import { Input } from "@f3/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@f3/ui/select";
import { Spinner } from "@f3/ui/spinner";
import { Textarea } from "@f3/ui/textarea";
import { toast } from "@f3/ui/toast";
import { EventInsertSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";

export default function AdminWorkoutsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_EVENTS];
}) {
  const utils = api.useUtils();
  const { data: regions } = api.region.all.useQuery();
  const { data: locations } = api.location.all.useQuery();
  const { data: event } = api.event.byId.useQuery({ id: data.id ?? -1 });
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    schema: EventInsertSchema,
    defaultValues: {
      id: event?.id ?? undefined,
      name: event?.name ?? "",
      isActive: event?.isActive ?? true,
      description: event?.description ?? "",
      orgId: event?.orgId ?? -1,
      highlight: event?.highlight ?? true,
      isSeries: event?.isSeries ?? true,
      locationId: event?.locationId ?? -1,
      dayOfWeek: event?.dayOfWeek,
      startTime: event?.startTime?.slice(0, 5) ?? "05:30",
      endTime: event?.endTime?.slice(0, 5) ?? "06:15",
      email: event?.email ?? null,
      regionId: event?.regionId ?? 0,
    },
  });

  useEffect(() => {
    form.reset({
      id: event?.id ?? undefined,
      name: event?.name ?? "",
      isActive: event?.isActive ?? true,
      description: event?.description ?? "",
      orgId: event?.orgId ?? -1,
      highlight: event?.highlight ?? true,
      isSeries: event?.isSeries ?? true,
      locationId: event?.locationId ?? -1,
      dayOfWeek: event?.dayOfWeek,
      startTime: event?.startTime?.slice(0, 5) ?? "05:30",
      endTime: event?.endTime?.slice(0, 5) ?? "06:15",
      email: event?.email ?? null,
      regionId: event?.regionId ?? 0,
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
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          const selectedValue = Number(value);
                          field.onChange(selectedValue);
                          form.setValue("locationId", -1); // Reset location selection
                        }}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions
                            ?.slice()
                            .sort(
                              (a, b) =>
                                a.name?.localeCompare(b.name ?? "") ?? 0,
                            )
                            .map((region) => (
                              <SelectItem
                                key={`region-${region.id}`}
                                value={region.id?.toString() ?? ""}
                              >
                                {region.name}
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
                  name="locationId"
                  render={({ field }) => {
                    const filteredLocations = locations?.filter(
                      (location) =>
                        location.regionId === form.watch("regionId"),
                    );
                    return (
                      <FormItem key={`location-${field.value}`}>
                        <FormLabel>Location</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            field.onChange(Number(value));

                            const selectedLocation = locations?.find(
                              (location) => location.id === Number(value),
                            );
                            if (selectedLocation) {
                              form.setValue(
                                "orgId",
                                Number(selectedLocation.orgId),
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
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((location) => (
                                <SelectItem
                                  key={`location-${location.id}`}
                                  value={location.id.toString()}
                                >
                                  {location.name}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
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
