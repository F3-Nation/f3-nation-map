import type { RouterOutputs } from "~/trpc/types";

export type F3MarkerLocation =
  RouterOutputs["location"]["getLocationMarkersSparse"][number];

export type F3Marker = NonNullable<
  RouterOutputs["location"]["getLocationMarker"]
>;

export interface SparseF3Marker {
  id: number;
  lat: number | null;
  lon: number | null;
  logo: string | null;
  locationDescription: string | null;
  events: {
    id: number;
    name: string;
    dayOfWeek: number | null;
    startTime: string | null;
    type: string | null;
  }[];
}

export type LocationMarkerEventWithLatLon = F3Marker["events"][number] & {
  lat: number;
  lon: number;
};

// export type F3MapSearchResultItem =
//   RouterOutputs["location"]["getAllLocationMarkers"][number]["events"][number] & {
//     lat: number | null;
//     lon: number | null;
//     locationDescription: string | null;
//   };

export interface F3MapSearchResult {
  header: string;
  // description: string;
  destination: {
    id: number;
    lat: number;
    lng: number;
    logo: string;
    item: {
      id: number;
      locationId: number;
      name: string;
      dayOfWeek: number | null;
      startTime: string | null;
      type: string | null;
    };
    placeId: null;
  };
}

export interface GeoMapSearchResult {
  header: string;
  description: string;
  destination: {
    id: string;
    lat: null;
    lng: null;
    item: null;
    placeId: string;
  };
}

export const isF3MapSearchResult = (
  result: F3MapSearchResult | GeoMapSearchResult,
): result is F3MapSearchResult => {
  return result.destination.item !== null;
};

export const isGeoMapSearchResult = (
  result: F3MapSearchResult | GeoMapSearchResult,
): result is GeoMapSearchResult => {
  return result.destination.item === null;
};
