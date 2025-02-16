"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@f3/ui/select";
import { Textarea } from "@f3/ui/textarea";
import { toast } from "@f3/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@f3/ui/tooltip";
import { LocationInsertSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";

export default function AdminLocationsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_LOCATIONS];
}) {
  const utils = api.useUtils();
  const { data: location } = api.location.byId.useQuery({ id: data.id ?? -1 });
  const { data: regions } = api.region.all.useQuery();
  const router = useRouter();

  const form = useForm({
    schema: LocationInsertSchema.extend({
      regionId: z.number(),
    }),
    defaultValues: {
      id: location?.id ?? undefined,
      name: location?.name ?? "",
      description: location?.description ?? "",
      isActive: location?.isActive ?? true,
      regionId: location?.regionId ?? -1,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      addressStreet: location?.addressStreet ?? null,
      addressCity: location?.addressCity ?? null,
      addressState: location?.addressState ?? null,
      addressZip: location?.addressZip ?? null,
      addressCountry: location?.addressCountry ?? null,
      //meta: location?.meta ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      id: location?.id ?? undefined,
      name: location?.name ?? "",
      description: location?.description ?? "",
      isActive: location?.isActive ?? true,
      regionId: location?.regionId ?? -1,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      addressStreet: location?.addressStreet ?? null,
      addressCity: location?.addressCity ?? null,
      addressState: location?.addressState ?? null,
      addressZip: location?.addressZip ?? null,
      addressCountry: location?.addressCountry ?? null,
      // meta: location?.meta ?? null,
    });
  }, [form, location]);

  const crupdateLocation = api.location.crupdate.useMutation({
    onSuccess: async () => {
      await utils.location.invalidate();
      closeModal();
      toast.success("Successfully updated location");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update users"
          : "Failed to update user",
      );
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[1024px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Location</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap">
          <div className="w-1/2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  (data) => {
                    crupdateLocation.mutate(data);
                  },
                  (error) => {
                    toast.error("Failed to update user");
                    console.log(error);
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <CircleHelp
                                  size={14}
                                  className="display-inline ml-2"
                                />
                              </TooltipTrigger>
                              <TooltipContent>Lorem Ipsum</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                        <FormItem key={`area-${field.value}`}>
                          <FormLabel>Region</FormLabel>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={field.value?.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions
                                ?.slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((region) => (
                                  <SelectItem
                                    key={`region-${region.id}`}
                                    value={region.id.toString()}
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
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Latitude"
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
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Longitude"
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
                      name="addressStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street"
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
                      name="addressCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
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
                      name="addressState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
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
                      name="addressZip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Zip"
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
                      name="addressCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Country"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
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
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              rows={5}
                            />
                          </FormControl>
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
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <div className="w-1/2">MAP CONTAINER</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
