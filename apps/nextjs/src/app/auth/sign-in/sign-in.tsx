"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";

import { Form, useForm } from "@acme/ui/form";
import { ControlledInput } from "@acme/ui/input";
import { Loader } from "@acme/ui/loader";
import { toast } from "@acme/ui/toast";

import { VersionInfo } from "~/app/_components/version-info";
import { AuthWrapper } from "../wrapper";

const SignInFormSchema = z.object({
  email: z.string().email(),
});

interface SignInProps {
  callbackUrl?: string;
}

export const SignIn = (params: SignInProps) => {
  const session = useSession();
  const user = session.data?.user;
  const [state, setState] = React.useState<
    | {
        status: "loading" | "idle" | "success" | "error";
      }
    | { status: "verify-email"; email: string }
  >({ status: "idle" });
  const router = useRouter();
  const form = useForm({
    schema: SignInFormSchema,
    mode: "onBlur",
  });
  const { control, formState, getFieldState, setError, getValues } = form;

  useEffect(() => {
    if (state?.status === "verify-email" && user?.email === state.email) {
      void router.push(params.callbackUrl ?? "/");
    }
  }, [state, user, router, params.callbackUrl]);

  const onSubmitEmailAuth = useCallback(() => {
    if (formState.errors.email) {
      toast.error("Please check the form");
      setError("email", {
        message: `Please use a valid email`,
      });
      return;
    }
    setState({ status: "loading" });
    toast.success("Sending email link...");
    const data = getValues();
    void signIn("email", {
      callbackUrl: params.callbackUrl ?? "/",
      email: data.email,
    }).finally(() => {
      // Timeout so it doesn't flicker back
      setTimeout(() => {
        setState({ status: "success" });
      }, 1000);
    });
  }, [params.callbackUrl, formState.errors.email, getValues, setError]);

  const resetPage = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  if (
    formState.isSubmitting ||
    formState.isLoading ||
    state.status === "loading"
  ) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center">
        <h2 className="mt-2 text-center text-3xl font-semibold">
          {"Sign in to F3 Nation"}
        </h2>
      </div>
      <AuthWrapper className="pb-8 pt-2">
        {state?.status === "idle" ? (
          <Form {...form}>
            <ControlledInput
              control={control}
              name="email"
              label="Email"
              placeholder="him@f3nation.com"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  // Don't check for validity here, because we want to allow the user to sign in with an invalid email
                  if (getFieldState("email").invalid) {
                    return;
                  }
                  void onSubmitEmailAuth();
                }
              }}
            />
            <button
              type="button"
              disabled={
                !!formState.errors.email || !formState.dirtyFields.email
              }
              onClick={onSubmitEmailAuth}
              className="mt-4 flex w-full cursor-pointer justify-center rounded-md bg-foreground px-4 py-2 text-background disabled:bg-foreground/50"
            >
              Sign in with email link
            </button>
            <p className="mt-4 text-justify text-[13px] text-muted-foreground">
              <span className="font-bold text-primary">IMPORTANT</span>: We are
              working on combining all of your F3 data into one unified spot.
              Map data, workout data from different Slack workspaces, etc - all
              together. To link your data between these different places, we're
              going to use your email address. So when you log in,{" "}
              <span className="font-bold">
                use the email you'd like to use for all F3 applications
              </span>{" "}
              going forward.
            </p>
          </Form>
        ) : state.status === "verify-email" ? (
          <>
            <h2 className="mb-4 mt-2 text-3xl font-semibold">
              {"Verify your email"}
            </h2>
            <div>
              A verification link has been sent to{" "}
              <span className="text-blue-500">{state.email}</span>!
            </div>
            <div className="mt-4">
              <span>
                Please check your email to verify this address, then you will
                continue where you left off
              </span>
            </div>
            <button
              className="mt-4 text-blue-500 underline"
              onClick={resetPage}
            >
              Return to Sign in
            </button>
          </>
        ) : null}
      </AuthWrapper>
      <VersionInfo className="my-4 w-full text-center" />
    </div>
  );
};
