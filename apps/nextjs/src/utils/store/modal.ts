import type { ReactNode } from "react";

import type { DayOfWeek, RequestType } from "@acme/shared/app/enums";
import { ZustandStore } from "@acme/shared/common/classes";

import type { RouterOutputs } from "~/trpc/types";
import { mapStore } from "./map";

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
  DELETE_CONFIRMATION = "DELETE_CONFIRMATION",
  ADMIN_DELETE_REQUEST = "ADMIN_DELETE_REQUEST",
  QR_CODE = "QR_CODE",
}
export enum DeleteType {
  AREA = "AREA",
  AO = "AO",
  EVENT = "EVENT",
  REGION = "REGION",
  SECTOR = "SECTOR",
  NATION = "NATION",
}

export const eventDefaults = {
  eventId: -1,
  workoutName: "",
  startTime: "0530",
  endTime: "0615",
  dayOfWeek: null,
  types: ["Bootcamp"],
  eventDescription: "",
};

export const locationDefaults = {
  locationId: null,
  locationAddress: "",
  locationAddress2: "",
  locationCity: "",
  locationState: "",
  locationZip: "",
  locationCountry: "",
  locationDescription: "",
  aoName: "",
  aoLogo: "",
  workoutWebsite: "",
  regionId: null,
};

export const eventAndLocationToUpdateRequest = ({
  event,
  location,
}: {
  event:
    | NonNullable<
        RouterOutputs["location"]["getAoWorkoutData"]
      >["location"]["events"][number]
    | undefined;
  location: NonNullable<
    RouterOutputs["location"]["getAoWorkoutData"]
  >["location"];
}): Omit<DataType[ModalType.UPDATE_LOCATION], "mode" | "requestType"> => {
  const possiblyEditedLoc = mapStore.get("modifiedLocationMarkers")[
    location.locationId
  ];

  const lat = possiblyEditedLoc?.lat ?? location.lat;
  const lng = possiblyEditedLoc?.lon ?? location.lon;

  return {
    eventId: event?.eventId ?? null,
    workoutName: event?.eventName ?? null,
    lat,
    lng,
    startTime: event?.startTime ?? null,
    endTime: event?.endTime ?? null,
    dayOfWeek: event?.dayOfWeek ?? null,
    types: event?.types ?? [],
    eventDescription: event?.description ?? null,
    locationId: location.locationId,
    aoName: location.parentName,
    locationAddress: location.locationAddress,
    locationAddress2: location.locationAddress2,
    locationCity: location.locationCity,
    locationState: location.locationState,
    locationZip: location.locationZip,
    locationCountry: location.locationCountry,
    locationDescription: location.locationDescription,
    regionId: location.regionId,
    workoutWebsite: location.parentWebsite,
    aoLogo: location.parentLogo,
  };
};

export interface DataType {
  [ModalType.HOW_TO_JOIN]: {
    content?: ReactNode;
  };
  [ModalType.UPDATE_LOCATION]: {
    requestType: RequestType;
    locationId: number | null;
    eventId: number | null;
    regionId: number | null;
    workoutName: string | null;
    workoutWebsite: string | null;
    aoLogo: string | null;
    aoName: string | null;
    lat: number;
    lng: number;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: DayOfWeek | null;
    types: string[];
    eventDescription: string | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
  };
  [ModalType.WORKOUT_DETAILS]: {
    locationId?: number | null;
    eventId?: number | null;
  };
  [ModalType.INFO]: null;
  [ModalType.USER_LOCATION_INFO]: null;
  [ModalType.SETTINGS]: null;
  [ModalType.ADMIN_USERS]: {
    id?: number | null;
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
  [ModalType.DELETE_CONFIRMATION]: {
    type: DeleteType;
    onConfirm: () => void;
  };
  [ModalType.ADMIN_DELETE_REQUEST]: {
    id: string;
  };
  [ModalType.QR_CODE]: {
    url: string;
    fileName: string;
    title: string;
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
  const existingModals = modalStore.get("modals");

  modalStore.setState({
    modals: [
      // Prevent duplicate modals
      ...existingModals.filter((m) => m.type !== type),
      { open: true, type, data },
    ],
  });
};

export const useOpenModal = () => {
  const modals = modalStore.use.modals();
  return modals[modals.length - 1];
};

export const closeModal = (open?: boolean, type?: ModalType) => {
  const modals = modalStore.get("modals");
  if (type) {
    const lessModals = modals.filter((m) => m.type !== type);
    modalStore.setState({
      modals: lessModals,
    });
  } else {
    const lessOneModals = modals.slice(0, -1);
    modalStore.setState({
      modals: lessOneModals,
    });
  }
  // Modal becomes unresponsive when closing with select menu open or similar
  // https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2613189967
  setTimeout(() => {
    const body = document.querySelector("body");
    if (body) {
      body.style.pointerEvents = "auto";
    }
  }, 500);
};
