import type { ReactNode } from "react";
import { create } from "zustand";

import { hideSelectedItem } from "./selected-item";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
  UPDATE_LOCATION = "UPDATE_LOCATION",
  WORKOUT_DETAILS = "WORKOUT_DETAILS",
  INFO = "INFO",
  SETTINGS = "SETTINGS",
}

export interface DataType {
  [ModalType.HOW_TO_JOIN]: null;
  [ModalType.UPDATE_LOCATION]: {
    mode: "edit-event" | "new-location" | "new-event";
    locationId?: number | null;
    eventId?: number | null;
    regionId?: number | null;
    workoutName?: string | null;
    workoutWebsite?: string | null;
    aoLogo?: string | null;
    lat: number;
    lng: number;
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek?: number | null;
    types?: { id: number; name: string }[];
    eventDescription?: string | null;
    locationAddress?: string | null;
  };
  [ModalType.WORKOUT_DETAILS]: {
    locationId?: number | null;
    eventId?: number | null;
  };
  [ModalType.INFO]: null;
  [ModalType.USER_LOCATION_INFO]: null;
  [ModalType.SETTINGS]: null;
}

export const useModalStore = create(() => ({
  open: false as boolean,
  type: undefined as ModalType | undefined,
  content: "" as ReactNode,
  data: null as DataType[ModalType] | null,
}));

export const openModal = <T extends ModalType>(type: T, data?: DataType[T]) => {
  if (type === ModalType.WORKOUT_DETAILS) {
    hideSelectedItem();
  }
  useModalStore.setState({ open: true, type, data });
};

export const closeModal = () => {
  useModalStore.setState({ open: false, type: undefined });
};
