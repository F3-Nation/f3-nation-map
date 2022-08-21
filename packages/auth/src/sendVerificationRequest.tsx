import type { Theme } from "@auth/core/types";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
} from "nodemailer";

import { isProduction } from "@f3/shared/common/constants";

const SHOW_MOBILE = false;

export const sendVerificationRequest: NodemailerConfig["sendVerificationRequest"] =
  async (params) => {
    const { identifier, url, provider, theme } = params;
    const { host } = new URL(url);
    const protocol = url.split("://")[0] + "://";
    const search = new URL(url).search;
    const mobileUrl = SHOW_MOBILE
      ? `${protocol}${host}/redirect-to-app${search}`
      : undefined;

    // In dev, use ethereal.email as test account
    const transportOptions: SMTPTransport.Options = isProduction
      ? (provider.server as SMTPTransport.Options)
      : await createTestAccount().then(({ user, pass }) => ({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user, pass },
        }));

    const transport = createTransport(transportOptions);
    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: `Sign in to ${host}`,
      text: text({ url, mobileUrl, host }),
      html: html({ url, mobileUrl, host, theme }),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
      throw new Error(`Email (${failed.join(", ")}) could not be sent`);
    }

    if (!isProduction) {
      console.log("Development email bypass!", {
        etherealMail: getTestMessageUrl(result),
        mobileUrl,
        url,
      });
    }
  };

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params: {
  url: string;
  host: string;
  theme: Theme;
  mobileUrl?: string;
}) {
  const { url, host, theme, mobileUrl } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor ?? "#346df1";

  const buttonText = theme.buttonText ?? "#fff";

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  return `
<body style="background: ${color.background};">
	<table width="100%" border="0" cellspacing="20" cellpadding="0"
		style="background: ${
      color.mainBackground
    }; max-width: 600px; margin: auto; border-radius: 10px;">
		<tr>
			<td align="center"
				style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${
          color.text
        };">
				Sign in to <strong>${escapedHost}</strong>
			</td>
		</tr>
		<tr>
			<td align="center" style="padding: 20px 0;">
				<table border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center" style="border-radius: 5px;" bgcolor="${
              color.buttonBackground
            }">
							<a href="${url}"
								target="_blank"
								style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${
                  color.buttonText
                }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${
                  color.buttonBorder
                }; display: inline-block; font-weight: bold;">
								Browser sign in
							</a>
						</td>
					</tr>
					${
            mobileUrl
              ? `<tr><td height="20"></td></tr>
					<tr style="display: flex; flex-direction: column;">
						<td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
							<a href="${mobileUrl}"
								target="_blank"
								style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
								Mobile app sign in
							</a>
						</td>
					</tr>`
              : ""
          }
				</table>
			</td>
		</tr>
		<tr>
			<td align="center"
				style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${
          color.text
        };">
				If you did not request this email you can safely ignore it.
			</td>
		</tr>
	</table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({
  url,
  host,
  mobileUrl,
}: {
  url: string;
  host: string;
  mobileUrl?: string;
}) {
  return `Sign in to ${host} in your browser\n${url}\n\n${
    mobileUrl ? `Or sign in to the mobile app\n${mobileUrl}\n\n` : ""
  }`;
}
