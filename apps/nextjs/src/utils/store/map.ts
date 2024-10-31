import type { LatLng, LatLngBounds, LatLngLiteral, Map } from "leaflet";

import { DEFAULT_ZOOM } from "@f3/shared/app/constants";
import { ZustandStore } from "@f3/shared/common/classes";

const initialState = {
  // selectedItem: null as (GroupedMapData & WorkoutData) | null,
  zoom: DEFAULT_ZOOM,
  userGpsLocation: null as { latitude: number; longitude: number } | null,
  userInitialIpLocation: null as {
    latitude: number;
    longitude: number;
  } | null,
  bounds: null as LatLngBounds | null,
  center: null as LatLng | null,
  ref: {
    current: null as Map | null,
  },
  placeResultArea: null as string | null,
  placeResultLocation: null as LatLngLiteral | null,
  expansionNearbyUsers: {
    center: null as LatLngLiteral | null,
    nearbyUsers: [] as { lat: number; lng: number; id: string; area: string }[],
  },
  expansionPopupOpen: true,
  expansionAreaSelected: {
    area: null as string | null,
    lat: null as number | null,
    lng: null as number | null,
  },
  tiles: "street" as "satellite" | "street",
  showDebug: false,
};

export const mapStore = new ZustandStore({
  initialState,
  persistOptions: {
    name: "map-store",
    version: 1,
    persistedKeys: [],
    getStorage: () => localStorage,
  },
});
