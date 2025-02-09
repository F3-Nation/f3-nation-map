"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { Z_INDEX } from "@f3/shared/app/constants";
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
import { toast } from "@f3/ui/toast";
import { UpdateRequestFormSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { scaleAndCropImage } from "~/utils/image/scale-and-crop-image";
import { uploadLogo } from "~/utils/image/upload-logo";
import { closeModal } from "~/utils/store/modal";
import { DebouncedImage } from "../debounced-image";

export default function AdminRequestsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_REQUESTS];
}) {
  const utils = api.useUtils();
  const { data: request } = api.request.byId.useQuery({ id: data.id });
  const router = useRouter();

  const form = useForm({
    schema: UpdateRequestFormSchema,
    defaultValues: {
      id: request?.id ?? uuid(),
      // meta: request?.meta ?? null,
      badImage: false,
    },
  });

  useEffect(() => {
    form.reset({
      id: request?.id ?? uuid(),
      // meta: request?.meta ?? null,
      badImage: false,
    });
  }, [form, request]);

  const crupdateRequest = api.request.updateLocation.useMutation({
    onSuccess: async () => {
      await utils.region.invalidate();
      closeModal();
      toast.success("Successfully updated request");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update requests"
          : "Failed to update request",
      );
    },
  });

  const formRegionId = form.watch("regionId");
  // TODO: generate a real formId
  const formId = "1";

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Request</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (values) => {
                crupdateRequest.mutate({
                  id: values.id,
                  orgId: values.regionId,
                  eventName: values.workoutName,
                  locationId: request?.locationId,
                  eventId: request?.eventId ?? null,
                  eventTypes: values.eventTypes,
                  eventTag: null,
                  eventStartTime: values.startTime
                    ? values.startTime + ":00"
                    : null,
                  eventEndTime: values.endTime ? values.endTime + ":00" : null,
                  eventDayOfWeek: values.dayOfWeek,
                  eventDescription: values.eventDescription,
                  locationDescription: values.locationAddress,
                  locationLat: values.lat,
                  locationLng: values.lng,
                });
              },
              (error) => {
                toast.error("Failed to update user");
                console.log(error);
              },
            )}
            className="space-y-4"
          >
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
                          if (!formRegionId) return;
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
                          const blob64 = await scaleAndCropImage(file, 64, 64);
                          if (blob64) {
                            void uploadLogo({
                              file: blob64,
                              regionId: formRegionId,
                              requestId: formId,
                              size: 64,
                            });
                          }
                        }}
                        disabled={
                          typeof formRegionId !== "number" || formRegionId <= -1
                        }
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

            <FormField
              control={form.control}
              name="workoutName"
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
