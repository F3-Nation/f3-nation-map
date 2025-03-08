import type { DayOfWeek } from "@acme/shared/app/enums";

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
  logo?: string | null;
  locationName: string | null;
  locationDescription: string | null;
  events: {
    id: number;
    name: string;
    dayOfWeek: DayOfWeek | null;
    startTime: string | null;
    types: string[];
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

export interface F3RegionMapSearchResult {
  header: string;
  type: "region";
  destination: {
    id: number;
    lat: number;
    lng: number;
    logo: string | null;
    locationId: number;
    placeId: null;
    item: null;
  };
}

export interface F3LocationMapSearchResult {
  header: string;
  type: "location";
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
      dayOfWeek: DayOfWeek | null;
      startTime: string | null;
      types: string[];
    };
    placeId: null;
  };
}

export interface GeoMapSearchResult {
  header: string;
  type: "geo";
  description: string;
  destination: {
    id: string;
    lat: null;
    lng: null;
    item: null;
    placeId: string;
  };
}

export const isF3LocationMapSearchResult = (
  result:
    | F3LocationMapSearchResult
    | GeoMapSearchResult
    | F3RegionMapSearchResult,
): result is F3LocationMapSearchResult => {
  return result.type === "location";
};

export const isGeoMapSearchResult = (
  result:
    | F3LocationMapSearchResult
    | GeoMapSearchResult
    | F3RegionMapSearchResult,
): result is GeoMapSearchResult => {
  return result.type === "geo";
};

export const isF3RegionMapSearchResult = (
  result:
    | F3LocationMapSearchResult
    | GeoMapSearchResult
    | F3RegionMapSearchResult,
): result is F3RegionMapSearchResult => {
  return result.type === "region";
};
