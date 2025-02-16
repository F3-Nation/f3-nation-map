"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { Spinner } from "@f3/ui/spinner";
import { Textarea } from "@f3/ui/textarea";
import { toast } from "@f3/ui/toast";
import { AOInsertSchema } from "@f3/validators";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { closeModal } from "~/utils/store/modal";

export default function AdminAOsModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_AOS];
}) {
  const utils = api.useUtils();
  const { data: ao } = api.ao.byId.useQuery({ id: data.id ?? -1 });
  const { data: regions } = api.region.all.useQuery();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    schema: AOInsertSchema.partial({ orgTypeId: true }),
    defaultValues: {
      id: ao?.id ?? undefined,
      name: ao?.name ?? "",
      parentId: ao?.parentId ?? -1,
      defaultLocationId: ao?.defaultLocationId ?? null,
      isActive: ao?.isActive ?? true,
      description: ao?.description ?? "",
      logoUrl: ao?.logoUrl ?? null,
      website: ao?.website ?? null,
      email: ao?.email ?? null,
      twitter: ao?.twitter ?? null,
      facebook: ao?.facebook ?? null,
      instagram: ao?.instagram ?? null,
      lastAnnualReview: ao?.lastAnnualReview ?? null,
      meta: ao?.meta ?? {},
    },
  });

  useEffect(() => {
    form.reset({
      id: ao?.id ?? undefined,
      name: ao?.name ?? "",
      parentId: ao?.parentId ?? -1,
      defaultLocationId: ao?.defaultLocationId ?? null,
      isActive: ao?.isActive ?? true,
      description: ao?.description ?? "",
      logoUrl: ao?.logoUrl ?? null,
      website: ao?.website ?? null,
      email: ao?.email ?? null,
      twitter: ao?.twitter ?? null,
      facebook: ao?.facebook ?? null,
      instagram: ao?.instagram ?? null,
      lastAnnualReview: ao?.lastAnnualReview ?? null,
      meta: ao?.meta ?? null,
    });
  }, [form, ao]);

  const crupdateAO = api.ao.crupdate.useMutation({
    onSuccess: async () => {
      await utils.ao.invalidate();
      closeModal();
      toast.success("Successfully updated ao");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update aos"
          : "Failed to update ao",
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
          <DialogTitle className="text-center">Edit AO</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (data) => {
                setIsSubmitting(true);
                try {
                  await crupdateAO.mutateAsync(data);
                } catch (error) {
                  toast.error("Failed to update ao");
                  console.error(error);
                } finally {
                  setIsSubmitting(false);
                }
              },
              (error) => {
                toast.error("Failed to update ao");
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
                  name="parentId"
                  render={({ field }) => (
                    <FormItem key={`region-${field.value}`}>
                      <FormLabel>Region</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Website"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
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
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Twitter"
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
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Facebook"
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
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Instagram"
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
                  name="lastAnnualReview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Annual Review</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Annual Review"
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
