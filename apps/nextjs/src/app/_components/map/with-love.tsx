"use client";

import Link from "next/link";

import { BOONE_CENTER } from "@f3/shared/app/constants";

import { setView } from "~/utils/set-view";
import { VersionInfo } from "../version-info";

export default function WithLove() {
  return (
    <div className="my-[1px] flex flex-row items-center justify-center gap-4">
      <div className="whitespace-nowrap text-xs text-foreground opacity-60">
        Made with <span className="text-[10px]">🥔</span> by{" "}
        <Link
          target="_blank"
          className="text-blue-600 underline underline-offset-2"
          href="https://linkedin.com/in/declan-nishiyama"
        >
          Spuds
        </Link>{" "}
        (
        <button
          className="text-foreground underline underline-offset-2"
          onClick={() => {
            setView({ lat: BOONE_CENTER[0], lng: BOONE_CENTER[1] });
          }}
        >
          F3 Boone
        </button>
        )
      </div>
      <VersionInfo className="text-center text-xs text-foreground/60" />
    </div>
  );
}
