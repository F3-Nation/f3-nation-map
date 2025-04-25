import type { NodemailerConfig } from "next-auth/providers/nodemailer";

import { env } from "@acme/env";

export interface SendVerificationRequestServerParams {
  apiKey: string;
  identifier: string;
  url: string;
  server: string;
  from: string;
  token: string;
}

export const sendOtpVerificationRequestServer: NodemailerConfig["sendVerificationRequest"] =
  async (params) => {
    const { identifier, url, provider, token } = params;
    const { host } = new URL(url);
    const protocol = url.split("://")[0] + "://";
    const search = new URL(url).search;

    const result = await fetch(`${protocol}${host}/api/otp${search}`, {
      method: "POST",
      body: JSON.stringify({
        apiKey: env.API_KEY,
        identifier,
        url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        server: provider.server,
        from: provider.from,
        token,
      }),
    });

    if (!result.ok) {
      throw new Error("Failed to send verification request");
    }
  };
