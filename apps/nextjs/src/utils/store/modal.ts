import type { ReactNode } from "react";

import type { DayOfWeek, RequestType } from "@acme/shared/app/enums";
import { ZustandStore } from "@acme/shared/common/classes";

import type { RouterOutputs } from "~/trpc/types";
import { mapStore } from "./map";

export enum ModalType {
  HOW_TO_JOIN = "HOW_TO_JOIN",
  USER_LOCATION_INFO = "USER_LOCATION_INFO",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
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
  ADMIN_EVENT_TYPES = "ADMIN_EVENT_TYPES",
  ADMIN_DELETE_CONFIRMATION = "ADMIN_DELETE_CONFIRMATION",
  ADMIN_DELETE_REQUEST = "ADMIN_DELETE_REQUEST",
  DELETE_CONFIRMATION = "DELETE_CONFIRMATION",
  QR_CODE = "QR_CODE",
  ABOUT_MAP = "ABOUT_MAP",
  MAP_HELP = "MAP_HELP",
  FULL_IMAGE = "FULL_IMAGE",
  SIGN_IN = "SIGN_IN",
  EDIT_MODE_INFO = "EDIT_MODE_INFO",
  AO_EDIT = "AO_EDIT",
  EVENT_EDIT = "EVENT_EDIT",
  LOCATION_EDIT = "LOCATION_EDIT",
  CREATE_EVENT = "CREATE_EVENT",
  CREATE_LOCATION_AND_EVENT = "CREATE_LOCATION_AND_EVENT",
  MOVE_AO_TO_NEW_LOCATION = "MOVE_AO_TO_NEW_LOCATION",
  MOVE_EVENT_TO_NEW_LOCATION = "MOVE_EVENT_TO_NEW_LOCATION",
  MOVE_AO_TO_DIFFERENT_LOCATION = "MOVE_AO_TO_DIFFERENT_LOCATION",
  MOVE_AO_TO_DIFFERENT_REGION = "MOVE_AO_TO_DIFFERENT_REGION",
  MOVE_EVENT_TO_DIFFERENT_AO = "MOVE_EVENT_TO_DIFFERENT_AO",
}
export enum DeleteType {
  USER = "USER",
  AREA = "AREA",
  LOCATION = "LOCATION",
  AO = "AO",
  EVENT = "EVENT",
  EVENT_TYPE = "EVENT_TYPE",
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
  eventTypeIds: [1],
  eventDescription: "",
  aoId: null,
  aoWebsite: "",
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
  regionId: null,
  regionWebsite: "",
};

export const eventAndLocationToUpdateRequest = ({
  event,
  location,
}: {
  event:
    | NonNullable<
        RouterOutputs["location"]["getLocationWorkoutData"]
      >["location"]["events"][number]
    | undefined;
  location: NonNullable<
    RouterOutputs["location"]["getLocationWorkoutData"]
  >["location"];
}): Omit<DataType[ModalType.UPDATE], "mode" | "requestType"> => {
  const possiblyEditedLoc = mapStore.get("modifiedLocationMarkers")[
    location.id
  ];

  const lat = possiblyEditedLoc?.lat ?? location.lat;
  const lng = possiblyEditedLoc?.lng ?? location.lon;

  return {
    eventId: event?.id ?? null,
    workoutName: event?.name ?? null,
    lat,
    lng,
    startTime: event?.startTime ?? null,
    endTime: event?.endTime ?? null,
    dayOfWeek: event?.dayOfWeek ?? null,
    eventTypeIds: event?.eventTypes.map((type) => type.id) ?? [],
    eventDescription: event?.description ?? null,
    locationId: location.id,
    locationAddress: location.locationAddress,
    locationAddress2: location.locationAddress2,
    locationCity: location.locationCity,
    locationState: location.locationState,
    locationZip: location.locationZip,
    locationCountry: location.locationCountry,
    locationDescription: location.locationDescription,
    regionId: location.regionId,
    regionWebsite: location.regionWebsite,
    aoId: event?.aoId ?? null,
    aoName: event?.aoName ?? null,
    aoLogo: event?.aoLogo ?? null,
    aoWebsite: event?.aoWebsite ?? null,
    originalRegionId: location.regionId,
    originalAoId: event?.aoId ?? null,
    originalLocationId: location.id,
  };
};

export interface DataType {
  [ModalType.HOW_TO_JOIN]: {
    content?: ReactNode;
  };
  [ModalType.UPDATE]: {
    requestType: Exclude<RequestType, "delete_ao" | "delete_event">;
    locationId: number | null;
    eventId: number | null;
    regionId: number | null;
    regionWebsite: string | null;
    workoutName: string | null;
    aoId: number | null;
    aoLogo: string | null;
    aoName: string | null;
    aoWebsite: string | null;
    lat: number | null;
    lng: number | null;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: DayOfWeek | null;
    eventTypeIds: number[] | null;
    eventDescription: string | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    originalLocationId: number | null;
  };
  [ModalType.AO_EDIT]: {
    requestType: Extract<RequestType, "edit_ao_and_location">;
    locationId: number | null;
    eventId: number | null;
    aoId: number | null;
    aoName: string | null;
    aoLogo: string | null;
    aoWebsite: string | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
    lat: number | null;
    lng: number | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    originalLocationId: number | null;
  };
  [ModalType.EVENT_EDIT]: {
    requestType: Extract<RequestType, "edit_event">;
    eventId: number | null;
    workoutName: string | null;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: DayOfWeek | null;
    eventTypeIds: number[] | null;
    eventDescription: string | null;
    aoId: number | null;
    aoName: string | null;
    aoLogo: string | null;
    aoWebsite: string | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    originalLocationId: number | null;
  };
  [ModalType.LOCATION_EDIT]: {
    locationId: number | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
  };
  [ModalType.CREATE_EVENT]: {
    requestType: Extract<RequestType, "create_event">;
    originalAoId: number | null;
    eventId: number | null;
    workoutName: string | null;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: DayOfWeek | null;
    eventTypeIds: number[] | null;
    eventDescription: string | null;
    originalRegionId: number | null;
    originalLocationId: number | null;
    regionId: number | null;
  };
  [ModalType.CREATE_LOCATION_AND_EVENT]: {
    requestType: Extract<RequestType, "create_location_and_event">;
    locationId: number | null;
    aoId: number | null;
    aoName: string | null;
    aoLogo: string | null;
    aoWebsite: string | null;
    lat: number | null;
    lng: number | null;
    originalRegionId: number | null;
    workoutName: string | null;
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: DayOfWeek | null;
    eventTypeIds: number[] | null;
    eventDescription: string | null;
    regionId: number | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
    originalAoId: number | null;
  };
  [ModalType.MOVE_AO_TO_NEW_LOCATION]: {
    requestType: Extract<RequestType, "move_ao_to_new_location">;
    aoId: number | null;
    lat: number | null;
    lng: number | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    originalLocationId: number | null;
  };
  [ModalType.MOVE_EVENT_TO_NEW_LOCATION]: {
    requestType: Extract<RequestType, "move_event_to_new_location">;
    eventId: number | null;
    lat: number | null;
    lng: number | null;
    locationAddress: string | null;
    locationAddress2: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    locationDescription: string | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    originalLocationId: number | null;
  };
  [ModalType.MOVE_AO_TO_DIFFERENT_LOCATION]: {
    requestType: Extract<RequestType, "move_ao_to_different_location">;
    aoId: number | null;
    locationId: number | null;
    originalLocationId: number | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    regionId: number | null;
  };
  [ModalType.MOVE_AO_TO_DIFFERENT_REGION]: {
    requestType: Extract<RequestType, "move_ao_to_different_region">;
    regionId: number | null;
    originalRegionId: number | null;
    originalAoId: number | null;
  };
  [ModalType.MOVE_EVENT_TO_DIFFERENT_AO]: {
    requestType: Extract<RequestType, "move_event_to_different_ao">;
    eventId: number | null;
    originalRegionId: number | null;
    originalAoId: number | null;
    aoId: number | null;
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
  [ModalType.ABOUT_MAP]: null;
  [ModalType.FULL_IMAGE]: {
    title: string;
    src: string;
    fallbackSrc: string;
    alt: string;
  };
  [ModalType.MAP_HELP]: null;
  [ModalType.ADMIN_EVENT_TYPES]: {
    id?: number | null;
  };
  [ModalType.SIGN_IN]: {
    callbackUrl?: string;
    message?: string;
  };
  [ModalType.EDIT_MODE_INFO]: null;
  [ModalType.DELETE]: {
    requestType: "delete_event" | "delete_ao";
    eventId: number | null;
    aoId: number | null;
    regionId: number | null;
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

export const closeModal = (open?: boolean, type?: ModalType | "all") => {
  const modals = modalStore.get("modals");
  if (type === "all") {
    modalStore.setState({ modals: [] });
  } else if (type) {
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
