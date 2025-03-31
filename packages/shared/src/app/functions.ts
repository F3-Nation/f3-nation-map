import { z } from "zod";

import type { DayOfWeek } from "./enums";
import { MAX_PLACES_AUTOCOMPLETE_RADIUS } from "./constants";

export function zoomToRadius(zoom: number): number {
  // Clamp zoom between 4 and 20
  // Constants
  const EARTH_EQUATORIAL_RADIUS = 6378137; // in meters
  const TILE_SIZE = 256;

  // Calculate the ground resolution at the equator
  const groundResolution =
    (EARTH_EQUATORIAL_RADIUS * 2 * Math.PI) / (TILE_SIZE * Math.pow(2, zoom));

  // Calculate radius (assuming the visible area is 256x256 pixels)
  const radius = (groundResolution * TILE_SIZE) / 2;

  return Math.min(Math.max(radius, 0), MAX_PLACES_AUTOCOMPLETE_RADIUS);
}

export default function isWithinRadius({
  miles,
  basePosition,
  checkPosition,
}: {
  miles: number;
  basePosition: { lat: number; long: number };
  checkPosition: { lat: number; long: number };
}): boolean {
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const R = 3958.8; // Radius of the Earth in miles

  const dLat = toRadians(checkPosition.lat - basePosition.lat);
  const dLong = toRadians(checkPosition.long - basePosition.long);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(basePosition.lat)) *
      Math.cos(toRadians(checkPosition.lat)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= miles;
}

const isoDateRegExp = new RegExp(
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
);

// Could do this with a custom zod preprocess, but this may be simpler
// https://github.com/colinhacks/zod#preprocess
const isISODate = (str: string): boolean => {
  return isoDateRegExp.test(str);
};

export const dateOrIso = z.union([
  z.date(),
  z.string().refine(isISODate, { message: "Not a valid ISO string date " }),
]);

export const dayOfWeekToShortDayOfWeek = (dayOfWeek: DayOfWeek): string => {
  switch (dayOfWeek) {
    case "sunday":
      return "Su";
    case "monday":
      return "M";
    case "tuesday":
      return "Tu";
    case "wednesday":
      return "W";
    case "thursday":
      return "Th";
    case "friday":
      return "F";
    case "saturday":
      return "Sa";
    default:
      return "Su";
  }
};

export const getReadableDayOfWeek = (dayOfWeek: DayOfWeek | null) => {
  if (!dayOfWeek) {
    return null;
  }
  return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
};
