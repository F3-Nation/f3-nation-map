import type { ReactNode } from "react";

import type { DayOfWeek } from "@acme/shared/app/enums";
import { ZustandStore } from "@acme/shared/common/classes";

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
  ADMIN_NATIONS = "ADMIN_NATIONS",
  ADMIN_SECTORS = "ADMIN_SECTORS",
  ADMIN_AREAS = "ADMIN_AREAS",
  ADMIN_REGIONS = "ADMIN_REGIONS",
  ADMIN_AOS = "ADMIN_AOS",
  ADMIN_DELETE_CONFIRMATION = "ADMIN_DELETE_CONFIRMATION",
}
export enum DeleteType {
  AREA = "AREA",
  AO = "AO",
  EVENT = "EVENT",
  REGION = "REGION",
  SECTOR = "SECTOR",
  NATION = "NATION",
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
    dayOfWeek?: DayOfWeek | null;
    types?: { id: number; name: string }[];
    eventDescription?: string | null;
    locationName?: string | null;
    locationAddress?: string | null;
    locationAddress2?: string | null;
    locationCity?: string | null;
    locationState?: string | null;
    locationZip?: string | null;
    locationCountry?: string | null;
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
    id?: number | null;
  };
  [ModalType.ADMIN_LOCATIONS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_NATIONS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_SECTORS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_AREAS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_REGIONS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_AOS]: {
    id?: number | null;
  };
  [ModalType.ADMIN_DELETE_CONFIRMATION]: {
    id: number;
    type: DeleteType;
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
  // Modal becomes unresponsive when closing with select menu open or similar
  // https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2613189967
  setTimeout(() => {
    const body = document.querySelector("body");
    if (body) {
      body.style.pointerEvents = "auto";
    }
  }, 500);
};
