import { Info } from "lucide-react";

import { ModalType, useModalStore } from "~/utils/store/modal";

export const InfoButton = () => {
  return (
    <button
      className="flex size-[36px] items-center justify-center rounded-md bg-background text-black shadow hover:bg-accent"
      onClick={() => {
        useModalStore.setState({
          open: true,
          type: ModalType.INFO,
        });
      }}
    >
      <Info size={16} className="text-foreground" />
    </button>
  );
};
