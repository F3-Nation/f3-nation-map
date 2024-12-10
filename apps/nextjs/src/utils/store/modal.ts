import type { ReactNode } from "react";
import { create } from "zustand";

import { hideSelectedItem } from "./selected-item";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
  WORKOUT_DETAILS = "WORKOUT_DETAILS",
  INFO = "INFO",
}

export const useModalStore = create(() => ({
  open: false as boolean,
  type: undefined as ModalType | undefined,
  content: "" as ReactNode,
  data: {} as Record<string, unknown>,
}));

export const openModal = (type: ModalType, data?: Record<string, unknown>) => {
  if (type === ModalType.WORKOUT_DETAILS) {
    hideSelectedItem();
  }
  useModalStore.setState({ open: true, type, data: data ?? {} });
};

export const closeModal = () => {
  useModalStore.setState({ open: false, type: undefined });
};
