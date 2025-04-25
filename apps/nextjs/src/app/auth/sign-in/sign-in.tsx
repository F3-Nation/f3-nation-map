"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";

import { ZustandStore } from "@acme/shared/common/classes";
import { ProviderId } from "@acme/shared/common/enums";
import { Form, useForm } from "@acme/ui/form";
import { ControlledInput, Input } from "@acme/ui/input";
import { Loader } from "@acme/ui/loader";
import { toast } from "@acme/ui/toast";

import { VersionInfo } from "~/app/_components/version-info";
import { AuthWrapper } from "../wrapper";

type AuthStatus = "idle" | "loading" | "verify-email" | "verify-code" | "error";

const authStore = new ZustandStore({
  initialState: {
    email: "",
    status: "idle" as AuthStatus,
    text: "",
    callbackUrl: "/",
  },
  persistOptions: {
    name: "auth-store",
    version: 1,
    persistedKeys: ["email"],
    getStorage: () => localStorage,
  },
});
const SignInFormSchema = z.object({
  email: z.string().email(),
});

interface SignInProps {
  callbackUrl?: string;
}

export const SignIn = (params: SignInProps) => {
  const status = authStore.use.status();
  const text = authStore.use.text();

  useEffect(() => {
    authStore.setState({ callbackUrl: params.callbackUrl ?? "/" });
  }, [params.callbackUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center">
        <h2 className="mt-2 text-center text-3xl font-semibold">
          {"Sign in to F3 Nation"}
        </h2>
      </div>
      <AuthWrapper className="py-6">
        {status === "loading" ? (
          <Loading text={text ?? "Loading..."} />
        ) : status === "idle" ? (
          <AuthForm />
        ) : status === "verify-email" ? (
          <VerifyEmail />
        ) : status === "verify-code" ? (
          <VerifyCode />
        ) : status === "error" ? (
          <ErrorCard />
        ) : null}
      </AuthWrapper>
      <VersionInfo className="my-4 w-full text-center" />
    </div>
  );
};

const Loading = (params: { text: string }) => {
  return (
    <div className="flex h-32 w-full flex-col items-center justify-center gap-4">
      <p className="text-lg text-muted-foreground">{params.text}</p>
      <Loader />
    </div>
  );
};

const AuthForm = () => {
  const email = authStore.use.email();

  const form = useForm({
    schema: SignInFormSchema,
    mode: "onChange",
    defaultValues: { email },
  });
  const { control, formState, getFieldState, setError, getValues } = form;

  useEffect(() => {
    form.setValue("email", email);
    void form.trigger();
  }, [email, form]);

  const onSubmitEmailLinkAuth = useCallback(() => {
    if (formState.errors.email) {
      toast.error("Please check the form");
      setError("email", {
        message: `Please use a valid email`,
      });
      return;
    }
    authStore.setState({
      status: "loading",
      text: "Sending email link...",
    });
    toast.success("Sending email link...");
    const data = getValues();
    void signIn(ProviderId.EMAIL, {
      callbackUrl: authStore.get("callbackUrl") ?? "/",
      email: data.email,
      redirect: false,
    }).finally(() => {
      // Timeout so it doesn't flicker back
      setTimeout(() => {
        authStore.setState({
          status: "verify-email",
          email: data.email,
        });
      }, 1000);
    });
  }, [formState.errors.email, getValues, setError]);

  const onSubmitEmailCodeAuth = useCallback(() => {
    if (formState.errors.email) {
      toast.error("Please check the form");
      setError("email", {
        message: `Please use a valid email`,
      });
      return;
    }
    authStore.setState({ status: "loading", text: "Sending code..." });
    toast.success("Sending code...");
    const data = getValues();
    void signIn(ProviderId.OTP, {
      email: data.email,
      redirect: false,
    })
      .then((d) => {
        // Timeout so it doesn't flicker back
        setTimeout(() => {
          authStore.setState({
            status: "verify-code",
            email: data.email,
          });
        }, 1000);
        console.log("success", d);
      })
      .catch(() => {
        authStore.setState({ status: "error", text: "Error sending code" });
      });
  }, [formState.errors.email, getValues, setError]);

  return (
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
            void onSubmitEmailCodeAuth();
          }
        }}
      />
      <button
        type="button"
        disabled={!!formState.errors.email}
        onClick={onSubmitEmailLinkAuth}
        className="mt-4 flex w-full cursor-pointer justify-center rounded-md bg-foreground px-4 py-2 text-background disabled:bg-foreground/50"
      >
        Sign in with email link
      </button>
      <button
        type="button"
        disabled={!!formState.errors.email}
        onClick={onSubmitEmailCodeAuth}
        className="mt-4 flex w-full cursor-pointer justify-center rounded-md bg-foreground px-4 py-2 text-background disabled:bg-foreground/50"
      >
        Sign in with code
      </button>
      <p className="mt-4 text-justify text-[13px] text-muted-foreground">
        <span className="font-bold text-primary">IMPORTANT</span>: We are
        working on combining all of your F3 data into one unified spot. Map
        data, workout data from different Slack workspaces, etc - all together.
        To link your data between these different places, we're going to use
        your email address. So when you log in,{" "}
        <span className="font-bold">
          use the email you'd like to use for all F3 applications
        </span>{" "}
        going forward.
      </p>
    </Form>
  );
};

const VerifyEmail = () => {
  const email = authStore.use.email();

  return (
    <>
      <h2 className="mb-4 mt-2 text-3xl font-semibold">
        {"Verify your email"}
      </h2>
      <div>
        A verification link has been sent to{" "}
        <span className="text-blue-500">{email}</span>!
      </div>
      <div className="mt-4">
        <span>
          Please follow the link in your email to continue where you left off
        </span>
      </div>
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => {
          authStore.setState({ status: "idle" });
        }}
      >
        Return to Sign in
      </button>
    </>
  );
};

const VerifyCode = () => {
  const email = authStore.use.email();
  const callbackUrl = authStore.use.callbackUrl();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(() => {
    setIsLoading(true);
    try {
      window.location.href = `/api/auth/callback/otp?email=${encodeURIComponent(
        email,
      )}&token=${code}&callbackUrl=${encodeURIComponent(callbackUrl || "/")}`;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [email, code, callbackUrl]);

  return (
    <>
      <h2 className="mb-4 mt-2 text-3xl font-semibold">{"Enter code"}</h2>
      <div>
        An access code has been sent to{" "}
        <span className="text-blue-500">{email}</span>. Please enter the code
        below to continue.
      </div>
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
        className="mt-4"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "NumpadEnter") {
            void onSubmit();
          }
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 flex w-full cursor-pointer justify-center rounded-md bg-foreground px-4 py-2 text-background disabled:bg-foreground/50"
      >
        {isLoading ? <Loader /> : "Verify code"}
      </button>
    </>
  );
};

const ErrorCard = () => {
  return (
    <div className="flex h-32 w-full flex-col items-center justify-center gap-4">
      <p className="text-lg text-muted-foreground">Error</p>
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => {
          authStore.setState({ status: "idle" });
        }}
      >
        Return to Sign in
      </button>
    </div>
  );
};
