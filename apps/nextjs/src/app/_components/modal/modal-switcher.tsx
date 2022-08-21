"use client";

import { ModalType, useModalStore } from "~/utils/store/modal";
import HowToJoinModal from "./how-to-join-modal";

export default function ModalSwitcher() {
  const { type } = useModalStore();

  switch (type) {
    case ModalType.HOW_TO_JOIN:
      return <HowToJoinModal />;
    default:
      return null;
  }
}
