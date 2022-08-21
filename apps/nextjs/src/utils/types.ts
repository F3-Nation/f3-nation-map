import type { RouterOutputs } from "~/trpc/types";

export type LocationMarkerEventWithLatLon =
  RouterOutputs["location"]["getAllLocationMarkers"][number]["events"][number] & {
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
  description: string;
  destination: {
    id: string;
    lat: number;
    lng: number;
    item: RouterOutputs["location"]["getAllLocationMarkers"][number]["events"][number];
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
