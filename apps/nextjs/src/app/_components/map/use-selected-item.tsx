import { useEffect } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { selectedItemStore } from "~/utils/store/selected-item";

export const useSelectedItem = () => {
  RERENDER_LOGS && console.log("useSelectedItem rerender");
  const locationId = selectedItemStore.use.locationId();
  const eventId = selectedItemStore.use.eventId();
  const { data: allLocationMarkers } =
    api.location.getAllLocationMarkers.useQuery();
  const selectedLocation = allLocationMarkers?.find(
    (locationMarker) => locationMarker.id === locationId,
  );
  const selectedEvent = !selectedLocation
    ? undefined
    : // check for null or undefined
      eventId === null || eventId === undefined
      ? selectedLocation.events[0]
      : // use == incase it is a string
        selectedLocation.events.find((event) => event.id == eventId);

  useEffect(() => {
    if (selectedLocation && eventId === null) {
      selectedItemStore.setState({
        eventId: selectedLocation.events[0]?.id,
      });
    }
  }, [eventId, selectedLocation]);

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful
  return {
    selectedLocation,
    selectedEvent,
  };
};
