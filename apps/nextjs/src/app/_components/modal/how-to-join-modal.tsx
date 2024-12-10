import Link from "next/link";

import { Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";

import { closeModal, useModalStore } from "~/utils/store/modal";

export default function HowToJoinModal() {
  const { open, content } = useModalStore();

  return (
    <Dialog open={open} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            How to join this workout
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-start space-x-2 pl-4 pr-4 text-left">
          <p className="!ml-0 mb-3 p-0">
            All F3 events are free and open to all men. If this is your first
            time, simply show up at the time and place and join us. Be prepared
            to sweat! We look forward to meeting you.
          </p>
          <p className="!ml-0 mb-3 p-0">
            You can also shoot a message to this site’s host (we call them site
            leaders) with your questions or just to touch base.
          </p>
          <div className="mb-5 mt-5 flex flex-col items-center justify-center gap-4">
            <Link
              className="flex cursor-pointer text-blue-500 underline"
              target="_blank"
              href={"#"}
            >
              Contact site leader
            </Link>
            {content}
            <Link
              className="flex cursor-pointer text-blue-500 underline"
              target="_blank"
              href={"https://f3nation.com/about-f3"}
            >
              FAQs
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
