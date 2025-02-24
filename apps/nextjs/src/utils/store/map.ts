import type { LatLng, LatLngBounds, LatLngLiteral, Map } from "leaflet";
import type { MutableRefObject } from "react";
import { createRef } from "react";

import { DEFAULT_ZOOM } from "@f3/shared/app/constants";
import { ZustandStore } from "@f3/shared/common/classes";

export type NearbyLocationCenterType =
  | "self"
  | "search"
  | "manual-update"
  | "default"
  | "click"
  | "random";

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
  updateLocation: null as LatLngLiteral | null,
  nearbyLocationCenter: {
    lat: null as LatLngLiteral["lat"] | null,
    lng: null as LatLngLiteral["lng"] | null,
    name: null as string | null,
    type: "default" as NearbyLocationCenterType,
  },
  tiles: "street" as "satellite" | "street",
  showDebug: false,
  loaded: false,
  dragging: false,
  hasMovedMap: false,
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
