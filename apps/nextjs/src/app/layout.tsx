import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@f3/ui";
import { ThemeProvider } from "@f3/ui/theme";
import { Toaster } from "@f3/ui/toast";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { HeaderAndSidebar } from "./_components/header-and-sidebar";
import { FilteredMapResultsProvider } from "./_components/map/filtered-map-results-provider";
import { TextSearchResultsProvider } from "./_components/map/search-results-provider";
import { UserLocationProvider } from "./_components/map/user-location-provider";
import ModalSwitcher from "./_components/modal/modal-switcher";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://f3.vercel.app"
      : "http://localhost:3000",
  ),
  title: "F3 Map",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "F3 Map",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://f3.vercel.app",
    siteName: "F3 Map",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <TRPCReactProvider>
            {/* FilteredMapResultsProvider must be inside TRPCReactProvider */}
            <UserLocationProvider>
              <TextSearchResultsProvider>
                <FilteredMapResultsProvider>
                  <HeaderAndSidebar>{props.children}</HeaderAndSidebar>
                  <ModalSwitcher />
                </FilteredMapResultsProvider>
              </TextSearchResultsProvider>
            </UserLocationProvider>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
