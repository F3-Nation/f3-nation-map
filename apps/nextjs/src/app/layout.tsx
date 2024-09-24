import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@f3/ui";

import { env } from "~/env";

import "leaflet/dist/leaflet.css";
import "~/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://maps.f3nation.com"
      : "http://localhost:3000",
  ),
  title: "F3 Nation Map",
  description: "Find F3 locations near you",
  openGraph: {
    title: "F3 Nation Map",
    description: "Find F3 locations near you",
    url: "https://maps.f3nation.com",
    siteName: "F3 Nation Map",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh w-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        {props.children}
      </body>
    </html>
  );
}
