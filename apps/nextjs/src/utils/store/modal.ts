import type { ReactNode } from "react";
import { create } from "zustand";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
  WORKOUT_DETAILS = "WORKOUT_DETAILS",
  INFO = "INFO",
  EXPANSION_FORM = "EXPANSION_FORM",
}

export const useModalStore = create(() => ({
  open: false as boolean,
  type: "" as ModalType,
  content: "" as ReactNode,
  data: {} as Record<string, unknown>,
}));
