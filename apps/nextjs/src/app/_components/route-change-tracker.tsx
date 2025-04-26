"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageView } from "~/utils/analytics/functions";

export default function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}
