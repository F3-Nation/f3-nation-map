"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

import type { ExpansionUserResponse } from "@f3/shared/app/schema/ExpansionUserSchema";
import { classNames } from "@f3/shared/common/functions";
import { useMediaQuery } from "@f3/shared/common/hooks";
import { Button } from "@f3/ui/button";
import { Dialog, DialogContent } from "@f3/ui/dialog";
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
import { Label } from "@f3/ui/label";
import { RadioGroup, RadioGroupItem } from "@f3/ui/radio-group";
import { Spinner } from "@f3/ui/spinner";
import { useTheme } from "@f3/ui/theme";

import { api } from "~/trpc/react";
import { getExpansionNearbyUsers } from "~/utils/get-expansion-nearby-users";
import { mapStore } from "~/utils/store/map";
import { useModalStore } from "~/utils/store/modal";

const ExpansionFeedbackModal = () => {
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const placeResultArea = mapStore.use.placeResultArea();
  const expansionAreaSelected = mapStore.use.expansionAreaSelected();
  const { open } = useModalStore();
  const { mutateAsync: createExpansionUser } =
    api.expansionUsers.createExpansionUser.useMutation();
  const { refetch } = api.expansionUsers.getExpansionUsers.useQuery();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    schema: z.object({
      area: z.string(),
      interestedInOrganizing: z.enum(["yes", "no"]),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Invalid phone number format",
      }),
      email: z.string().email(),
    }),
  });

  const email = form.watch("email");
  const phone = form.watch("phone");

  useEffect(() => {
    setError(null);
  }, [email, phone]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleSubmit = async (data: {
    area: string;
    interestedInOrganizing: "yes" | "no";
    phone?: string | undefined;
    email?: string | undefined;
  }) => {
    setIsLoading(true);
    mapStore.setState({
      expansionNearbyUsers: {
        nearbyUsers: [],
        center: null,
      },
      expansionPopupOpen: true,
    });

    let { lat, lng } = mapStore.get("expansionAreaSelected");
    if (lat === null || lng === null) {
      const placeResultLocation = mapStore.get("placeResultLocation");
      lat = placeResultLocation?.lat ?? 0;
      lng = placeResultLocation?.lng ?? 0;
    }
    const userLocation = mapStore.get("userGpsLocation");

    const requestData = {
      area: data.area,
      interestedInOrganizing: data.interestedInOrganizing === "yes",
      pinnedLat: lat,
      pinnedLng: lng,
      userLat: userLocation?.latitude ?? 0,
      userLng: userLocation?.longitude ?? 0,
      phone: data.phone ?? "",
      email: data.email ?? "",
    };

    try {
      await createExpansionUser(requestData);
      const { data: newExpansionUsers } = await refetch();

      getExpansionNearbyUsers({
        zoom: isDesktop ? 13 : 11,
        expansionUsers: newExpansionUsers as unknown as ExpansionUserResponse[],
        popupOpen: false,
      });

      useModalStore.setState({ open: false });

      form.reset({
        area: placeResultArea ?? "",
      });
    } catch (err) {
      const trpcError = err as Error;
      setError(trpcError?.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (placeResultArea) {
      form.setValue("area", expansionAreaSelected?.area ?? placeResultArea);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeResultArea, expansionAreaSelected.area]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => useModalStore.setState({ open: false })}
    >
      <DialogContent className="relative flex w-screen flex-col items-center text-center max-sm:h-[calc(100vh-48px)] max-sm:overflow-scroll">
        <div className="flex flex-col gap-y-4">
          <Link
            href="https://f3nation.com/"
            target="_blank"
            className="pointer-events-auto mx-auto"
          >
            <Image
              src="/f3_logo.png"
              alt="F3 Logo"
              width={42}
              height={42}
              className="rounded-md"
            />
          </Link>
          <h3 className="text-xl font-bold">Expansion Feedback</h3>
          <p className="max-w-[478px] text-sm">
            F3 is looking to expand in your area. Answering this quick survey
            helps to achieve that goal. Thank you in advance for your time.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-4 flex flex-col items-center gap-8 text-left"
            onSubmit={form.handleSubmit(async (data) => {
              await handleSubmit(data);
            }, console.error)}
          >
            <ol className="mx-4 flex list-decimal flex-col justify-start gap-4 text-sm ">
              <li>
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What area would you like to see an F3 Group started in?
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder=""
                          className={classNames(
                            isDark ? "border-white" : "border-black",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </li>
              <li>
                <FormField
                  control={form.control}
                  name="interestedInOrganizing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Would you be interested in organizing this group?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value}>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="yes"
                              id="yes"
                              onClick={() =>
                                form.setValue("interestedInOrganizing", "yes")
                              }
                            />
                            <Label htmlFor="yes">
                              Yes, I am open to helping organize.
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="no"
                              id="no"
                              onClick={() =>
                                form.setValue("interestedInOrganizing", "no")
                              }
                            />
                            <Label htmlFor="no">
                              No, I only want to attend.
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </li>

              <li>
                <div className="flex flex-col gap-2">
                  <FormLabel className="leading-tight">
                    How can we get in touch with you about this new group?
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Phone:</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            className={classNames(
                              isDark ? "border-white" : "border-black",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email:</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            className={classNames(
                              isDark ? "border-white" : "border-black",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </li>
            </ol>
            {error && (
              <div className="text-center text-sm text-red-600">{error}</div>
            )}
            <Button
              variant="outline"
              className="border-2 border-black bg-white px-6 py-6 text-base font-bold shadow-lg"
            >
              {isLoading ? (
                <Spinner className="h-4 w-4 border-2" />
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpansionFeedbackModal;
