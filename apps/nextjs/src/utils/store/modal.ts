import type { ReactNode } from "react";
import { create } from "zustand";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
}

export const useModalStore = create(() => ({
  open: false as boolean,
  type: "" as ModalType,
  content: "" as ReactNode,
}));
