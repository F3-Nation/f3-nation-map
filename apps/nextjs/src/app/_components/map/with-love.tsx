"use client";

import Link from "next/link";

import { BOONE_CENTER } from "@f3/shared/app/constants";

import { setView } from "~/utils/set-view";
import { VersionInfo } from "../version-info";

export default function WithLove() {
  return (
    <div className="my-[1px] flex flex-row items-center justify-center gap-4">
      <div className="whitespace-nowrap text-xs text-foreground opacity-60">
        Made with <span className="text-[7px] opacity-70">🖤️</span> by{" "}
        <Link
          target="_blank"
          className="text-blue-600 underline underline-offset-2"
          href="https://linkedin.com/in/declan-nishiyama"
        >
          Spuds
        </Link>{" "}
        (
        <button
          onClick={() => {
            setView({ lat: BOONE_CENTER[0], lng: BOONE_CENTER[1] });
          }}
        >
          F3 Boone
        </button>
        )
      </div>
      <VersionInfo className="absolute bottom-0 right-1 text-center text-xs" />
    </div>
  );
}
