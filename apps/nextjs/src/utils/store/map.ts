import type { LatLng, LatLngBounds, LatLngLiteral, Map } from "leaflet";
import { createRef } from "react";

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
  ref: createRef<Map>(),
  placeResultLocation: null as LatLngLiteral | null,
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
