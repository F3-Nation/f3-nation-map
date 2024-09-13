import { Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";

import { useModalStore } from "~/utils/store/modal";

export default function UserLocationInfoModal() {
  const { open, content } = useModalStore();

  return (
    <Dialog
      open={open}
      onOpenChange={() => useModalStore.setState({ open: false })}
    >
      <DialogContent
        style={{ zIndex: Z_INDEX.USER_LOCATION_INFO_MODAL }}
        className={cn(`w-[400px] max-w-[90%]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Using your location</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-start space-x-2 pl-4 pr-4 text-left">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
