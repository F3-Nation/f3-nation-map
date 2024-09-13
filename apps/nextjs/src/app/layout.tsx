import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@f3/ui";
import { ThemeProvider } from "@f3/ui/theme";
import { Toaster } from "@f3/ui/toast";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "leaflet/dist/leaflet.css";
import "~/app/globals.css";

import { TooltipProvider } from "@f3/ui/tooltip";

import { FilteredMapResultsProvider } from "./_components/map/filtered-map-results-provider";
import { TextSearchResultsProvider } from "./_components/map/search-results-provider";
import { UserLocationProvider } from "./_components/map/user-location-provider";
import ModalSwitcher from "./_components/modal/modal-switcher";
import { ShadCnContainer } from "./_components/shad-cn-container-ref";

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
        <DataProvider>
          <ElementProvider>{props.children}</ElementProvider>
        </DataProvider>
      </body>
    </html>
  );
}
const DataProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TRPCReactProvider>
      <UserLocationProvider>
        <TextSearchResultsProvider>
          <FilteredMapResultsProvider>{children}</FilteredMapResultsProvider>
        </TextSearchResultsProvider>
      </UserLocationProvider>
    </TRPCReactProvider>
  );
};

const ElementProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
      <Toaster />
      <ShadCnContainer />
      <ModalSwitcher />
    </ThemeProvider>
  );
};
