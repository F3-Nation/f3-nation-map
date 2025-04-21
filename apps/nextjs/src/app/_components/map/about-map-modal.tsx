"use client";

import Link from "next/link";

import { BOONE_CENTER, Z_INDEX } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { setView } from "~/utils/set-view";
import { closeModal } from "~/utils/store/modal";

export function AboutMapModal() {
  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle>About This Map</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            This map was built with ❤️️️ by{" "}
            <Link
              target="_blank"
              href="https://linkedin.com/in/declan-nishiyama"
              className="text-blue-600 underline underline-offset-2"
            >
              Spuds
            </Link>{" "}
            who runs{" "}
            <Link
              target="_blank"
              href="https://mountaindev.com"
              className="text-blue-600 underline underline-offset-2"
            >
              Mountain Dev
            </Link>
            , a full stack development studio
          </p>
          <p>
            He's in{" "}
            <button
              className="text-foreground underline underline-offset-2"
              onClick={() => {
                closeModal(undefined, "all");
                setView({ lat: BOONE_CENTER[0], lng: BOONE_CENTER[1] });
              }}
            >
              F3 Boone
            </button>{" "}
            and created this map to give back to the community.
          </p>
          <p>
            Shout out to Tackle — IT Director extraordinaire — and all the
            people of F3 IT for making this happen!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
