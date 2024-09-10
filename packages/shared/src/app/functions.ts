import type { GroupedMapData, LeafletWorkoutData } from "@f3/shared/app/types";
import { isDDD } from "@f3/shared/app/types";

import { MAX_PLACES_AUTOCOMPLETE_RADIUS } from "./constants";

export function groupMarkersByLocation(_mapData: LeafletWorkoutData[]) {
  // Object to hold the results, with lat-lng as key
  const groupedMarkers: Record<string, GroupedMapData> = {};

  _mapData.forEach((marker) => {
    // Create a unique key based on latitude and longitude
    const locationKey = `${marker.Latitude},${marker.Longitude}`;

    // If this is the first time we've seen this location, initialize it
    if (!groupedMarkers[locationKey]) {
      groupedMarkers[locationKey] = {
        id: locationKey,
        Location: marker.Location,
        Latitude: parseFloat(marker.Latitude),
        Longitude: parseFloat(marker.Longitude),
        Image: marker.Image,
        Name: marker.Name.toString(),
        Region: marker.Region,
        Website: marker.Website,
        Groups: [],
      };
    }

    // Add the group (day of the week) and time to the location
    groupedMarkers[locationKey]?.Groups.push({
      WorkoutName: marker.Name.toString(),
      "Day of week": isDDD(marker.Group) ? marker.Group : "Monday",
      Time: marker.Time,
      Type: marker.Type,
      Notes: marker.Notes.toString(),
      "Marker Icon": marker["Marker Icon"],
      "Marker Color": marker["Marker Color"],
      "Icon Color": marker["Icon Color"],
      "Custom Size": marker["Custom Size"],
      Description: marker.Description,
    });
  });

  // Convert the results back to an array
  return Object.values(groupedMarkers);
}

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
