"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  MapPin,
  PersonStanding,
  SquareChartGantt,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  ADMIN_HEADER_HEIGHT,
  ADMIN_SIDEBAR_WIDTH,
  routes,
} from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

import { VersionInfo } from "~/app/_components/version-info";

const Layout = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <div className="h-[100vh] w-full overflow-auto">
      <div
        className="fixed block w-full bg-[#ebebeb] lg:hidden"
        style={{ height: ADMIN_HEADER_HEIGHT }}
      >
        <div className="flex h-full w-full flex-row items-center justify-between px-4">
          <Image src="/f3_logo.png" alt="F3" width={48} height={48} />
          <div className="flex flex-row items-center gap-3">
            <Link
              className="flex items-center gap-1 text-sm font-medium"
              href={routes.admin.users.__path}
            >
              <User />
              Users
            </Link>
            <Link
              className="flex items-center gap-1 text-sm font-medium"
              href={routes.admin.requests.__path}
            >
              <SquareChartGantt />
              Requests
            </Link>
          </div>
        </div>
      </div>
      <div
        className="fixed hidden h-full bg-[#ebebeb] lg:block"
        style={{ width: ADMIN_SIDEBAR_WIDTH, zIndex: 1000 }}
      >
        <div className="h-[90%]">
          <div className="px-2 py-6">
            <div className="flex justify-center">
              <Image src="/f3_logo.png" alt="F3" width={100} height={100} />
            </div>
            <Link
              className={cn(
                "mb-3 flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                pathname === routes.admin.users.__path ? "bg-[#D6D6D6]" : "",
              )}
              href={routes.admin.users.__path}
            >
              <User />
              Users
            </Link>
            <Link
              className={cn(
                "mb-3 flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                pathname === routes.admin.requests.__path ? "bg-[#D6D6D6]" : "",
              )}
              href={routes.admin.requests.__path}
            >
              <SquareChartGantt />
              Requests
            </Link>
            <Link
              className={cn(
                "mb-3 flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                pathname === routes.admin.locations.__path
                  ? "bg-[#D6D6D6]"
                  : "",
              )}
              href={routes.admin.locations.__path}
            >
              <MapPin />
              Locations
            </Link>
            <Link
              className={cn(
                "mb-3 flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                pathname === routes.admin.workouts.__path ? "bg-[#D6D6D6]" : "",
              )}
              href={routes.admin.workouts.__path}
            >
              <PersonStanding />
              Events
            </Link>
            <Link
              className={cn(
                "mb-3 flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                pathname === routes.admin.regions.__path ? "bg-[#D6D6D6]" : "",
              )}
              href={routes.admin.regions.__path}
            >
              <Globe />
              Regions
            </Link>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <button
            className="rounded-md bg-primary px-4 py-2 text-base font-medium text-white"
            onClick={async () => {
              await signOut({
                callbackUrl: "/",
              });
            }}
          >
            Sign Out
          </button>
          <VersionInfo className="mt-2 text-center text-gray-600" />
        </div>
      </div>
      <div className={`flex flex-col lg:flex-row`}>
        <div
          className="hidden h-full flex-shrink-0 lg:block"
          style={{ width: ADMIN_SIDEBAR_WIDTH }}
        />
        <div
          className="block w-full flex-shrink-0 lg:hidden"
          style={{ height: ADMIN_HEADER_HEIGHT }}
        />
        <div className={cn("flex-1 p-10", className)}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
