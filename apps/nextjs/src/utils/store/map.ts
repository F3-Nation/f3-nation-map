import type { LatLng, LatLngBounds, LatLngLiteral, Map } from "leaflet";
import type { MutableRefObject } from "react";
import { createRef } from "react";

import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@acme/shared/app/constants";
import { ZustandStore } from "@acme/shared/common/classes";

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
  center: { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] } as LatLng,
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
  modifiedLocationMarkers: {} as Record<number, { lat: number; lon: number }>,
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
    persistedKeys: ["center", "zoom"],
    getStorage: () => localStorage,
    onRehydrateStorage: (state) => {
      console.log("onRehydrateStorage map", state);
      if (state?.center != undefined && state?.zoom != undefined) {
        console.log("onRehydrateStorage map hasMovedMap", state.hasMovedMap);
        mapStore.setState({ hasMovedMap: true });
      }
    },
  },
});
