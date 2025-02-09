import type { ReactNode } from "react";

import { ZustandStore } from "@f3/shared/common/classes";

import { hideSelectedItem } from "./selected-item";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
  UPDATE_LOCATION = "UPDATE_LOCATION",
  WORKOUT_DETAILS = "WORKOUT_DETAILS",
  INFO = "INFO",
  SETTINGS = "SETTINGS",
  ADMIN_USERS = "ADMIN_USERS",
  ADMIN_REQUESTS = "ADMIN_REQUESTS",
  ADMIN_EVENTS = "ADMIN_EVENTS",
  ADMIN_LOCATIONS = "ADMIN_LOCATIONS",
  ADMIN_REGIONS = "ADMIN_REGIONS",
}

export interface DataType {
  [ModalType.HOW_TO_JOIN]: {
    content?: ReactNode;
  };
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
  [ModalType.ADMIN_USERS]: {
    id: number;
  };
  [ModalType.ADMIN_REQUESTS]: {
    id: string;
  };
  [ModalType.ADMIN_EVENTS]: {
    id: number;
  };
  [ModalType.ADMIN_LOCATIONS]: {
    id: number;
  };
  [ModalType.ADMIN_REGIONS]: {
    id: number;
  };
}

export interface Modal<T extends ModalType> {
  open: boolean;
  type: T | undefined;
  content?: ReactNode;
  data?: DataType[T];
}

export const modalStore = new ZustandStore<{
  modals: Modal<ModalType>[];
}>({
  initialState: {
    modals: [] as Modal<ModalType>[],
  },
  persistOptions: {
    name: "modal",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});

export const openModal = <T extends ModalType>(type: T, data?: DataType[T]) => {
  if (type === ModalType.WORKOUT_DETAILS) {
    hideSelectedItem();
  }
  modalStore.setState({
    modals: [...modalStore.get("modals"), { open: true, type, data }],
  });
};

export const useOpenModal = () => {
  const modals = modalStore.use.modals();
  return modals[modals.length - 1];
};

export const closeModal = () => {
  const modals = modalStore.get("modals");
  const lessOneModals = modals.slice(0, -1);
  modalStore.setState({
    modals: lessOneModals,
  });
};
