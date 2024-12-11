import type { LatLng, LatLngBounds, LatLngLiteral, Map } from "leaflet";
import type { MutableRefObject } from "react";
import { createRef } from "react";

import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@f3/shared/app/constants";
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
  ref: createRef<Map>() as MutableRefObject<Map | null>,
  // This is updated in the map listener on pan and is used to convert latlng to container point - definitely a hack
  placeResultArea: null as string | null,
  placeResultLocation: null as LatLngLiteral | null,
  nearbyLocationCenter: {
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  } as LatLngLiteral & { name?: string },
  tiles: "street" as "satellite" | "street",
  showDebug: false,
  loaded: false,
  dragging: false,
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
