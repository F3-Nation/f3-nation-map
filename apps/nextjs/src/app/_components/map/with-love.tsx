import Link from "next/link";

import { BOONE_CENTER, CLOSE_ZOOM } from "@f3/shared/app/constants";

import { mapStore } from "~/utils/store/map";
import { VersionInfo } from "../version-info";

export default function WithLove() {
  const mapRef = mapStore.use.ref();
  return (
    <div className="my-[1px] flex flex-row items-center justify-center gap-4">
      <div className="whitespace-nowrap text-xs text-foreground opacity-60">
        Made with <span className="opacity-70 text-[9px]">❤️</span> by{" "}
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
            mapRef.current?.setView(
              BOONE_CENTER,
              Math.max(mapStore.get("zoom"), CLOSE_ZOOM),
              { animate: mapStore.get("zoom") === CLOSE_ZOOM },
            );
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
