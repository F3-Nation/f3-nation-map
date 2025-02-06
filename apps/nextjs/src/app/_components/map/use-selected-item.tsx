import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

import { CLOSE_ZOOM } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { mapStore } from "~/utils/store/map";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { useMapRef } from "./map-ref-provider";

export const useSelectedItem = () => {
  RERENDER_LOGS && console.log("useSelectedItem rerender");
  const zoom = mapStore.use.zoom();
  const isClose = zoom >= CLOSE_ZOOM;
  const debounceAmount = isClose ? 0 : 300;
  const locationId = selectedItemStore.use.locationId();
  const eventId = selectedItemStore.use.eventId();
  const [debouncedLocationId, setDebouncedLocationId] = useState(locationId);
  const { data } = api.location.getLocationMarker.useQuery(
    { id: debouncedLocationId ?? -1 },
    { enabled: typeof debouncedLocationId === "number" },
  );

  const selectedLocation =
    debouncedLocationId === locationId ? data : undefined;
  const { mapRef } = useMapRef();
  const position = useMemo(() => {
    if (
      typeof selectedLocation?.lat !== "number" ||
      typeof selectedLocation?.lon !== "number"
    )
      return undefined;
    return mapRef.current?.latLngToContainerPoint({
      lat: selectedLocation.lat,
      lng: selectedLocation.lon,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- zoom is not a dependency but we need to monitor its changes
  }, [selectedLocation?.lat, selectedLocation?.lon, mapRef, zoom]);

  const selectedEvent = !selectedLocation
    ? undefined
    : // check for null or undefined
      eventId === null || eventId === undefined
      ? selectedLocation.events[0]
      : // use == incase it is a string
        selectedLocation.events.find((event) => event.id == eventId);

  // Create memoized debounced function
  const debouncedSetSelectedItem = useMemo(
    () =>
      debounce((locationId: number | null) => {
        setDebouncedLocationId(locationId);
      }, debounceAmount),
    [debounceAmount],
  );

  useEffect(() => {
    debouncedSetSelectedItem(locationId);
  }, [debouncedLocationId, locationId, debouncedSetSelectedItem]);

  useEffect(() => {
    if (selectedLocation && eventId === null) {
      setSelectedItem({
        eventId: selectedLocation.events[0]?.id,
      });
    }
  }, [eventId, selectedLocation]);

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful
  return {
    locationId,
    eventId,
    selectedLocation,
    selectedEvent,
    pagePosition: position,
  };
};
