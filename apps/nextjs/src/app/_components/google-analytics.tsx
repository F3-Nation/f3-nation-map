"use client";

import { useEffect } from "react";
import Script from "next/script";

import { env } from "~/env";

/**
 * Google Analytics component
 *
 * This component is used to track user interactions with the website.
 * It is used to track user interactions with the website.
 * It is used to track user interactions with the website.
 */
export default function GoogleAnalytics() {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: [string, string | Date]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }, []);

  return env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
    />
  ) : null;
}
