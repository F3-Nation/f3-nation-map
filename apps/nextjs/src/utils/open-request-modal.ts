import type { RequestType } from "@acme/shared/app/enums";
import { requestTypeToTitle } from "@acme/shared/app/functions";
import { toast } from "@acme/ui/toast";

import { queryClientUtils } from "~/trpc/react";
import { mapStore } from "./store/map";
import { ModalType, openModal } from "./store/modal";

export const openRequestModal = (params: {
  type: RequestType;
  locationId?: number | null;
  eventId?: number | null;
  aoId?: number | null;
}) => {
  const requestType = params.type;

  const updateLocation = mapStore.get("updateLocation");

  const modifiedLocationMarker = params.locationId
    ? mapStore.get("modifiedLocationMarkers")[params.locationId]
    : null;

  const center = mapStore.get("center");
  const _locationDetails = params.locationId
    ? queryClientUtils.location.getLocationWorkoutData.getData({
        locationId: params.locationId,
      })?.location
    : null;

  const _eventDetails = _locationDetails?.events.find(
    (e) => e.id === params.eventId,
  );
  const eventDetails = !_eventDetails
    ? null
    : {
        aoName: _eventDetails?.aoName ?? null,
        aoLogo: _eventDetails?.aoLogo ?? null,
        aoWebsite: _eventDetails?.aoWebsite ?? null,
        eventTypeIds: _eventDetails?.eventTypes.map((type) => type.id) ?? null,
        eventDescription: _eventDetails?.description ?? null,
        startTime: _eventDetails?.startTime ?? null,
        workoutName: _eventDetails?.name ?? null,
        endTime: _eventDetails?.endTime ?? null,
        dayOfWeek: _eventDetails?.dayOfWeek ?? null,
      };
  console.log("openRequestModal", params, eventDetails);

  const locationDetails = {
    lat: modifiedLocationMarker?.lat ?? _locationDetails?.lat ?? center.lat,
    lng: modifiedLocationMarker?.lng ?? _locationDetails?.lon ?? center.lng,
    locationAddress: _locationDetails?.locationAddress ?? null,
    locationAddress2: _locationDetails?.locationAddress2 ?? null,
    locationCity: _locationDetails?.locationCity ?? null,
    locationState: _locationDetails?.locationState ?? null,
    locationZip: _locationDetails?.locationZip ?? null,
    locationCountry: _locationDetails?.locationCountry ?? null,
    locationDescription: _locationDetails?.locationDescription ?? null,
  };

  const originalEventId = params.eventId ?? null;
  const originalRegionId = _locationDetails?.regionId ?? null;
  const originalAoId = params.aoId ?? _eventDetails?.aoId;
  const originalLocationId = params.locationId ?? null;

  // requestTypeToTitle
  switch (requestType) {
    // Update pane 1
    case "create_location_and_event": // New Location, AO, & Event
      if (!updateLocation) {
        toastError(requestType, "Location not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        ...updateLocation, // lat & lng
        originalRegionId,
        requestType,
      });
      break;

    // Update pane 2
    case "move_ao_to_new_location": // Move existing AO here, Move AO to New Location
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        ...updateLocation,
        requestType,
      });
      break;

    // Update pane 3
    case "move_event_to_new_location": // Move existing event here, Move Workout to New Location
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        requestType,
      });
      break;

    case "create_event": // Add Workout to AO, New Workout
      if (!originalRegionId) {
        toastError(requestType, "Region id not found");
        return;
      }
      if (!originalAoId) {
        toastError(requestType, "AO id not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        originalAoId,
        requestType,
      });
      break;

    case "edit_event": // edit workout details
      if (!originalRegionId) {
        toastError(requestType, "Region id not found");
        return;
      }
      if (!originalEventId) {
        toastError(requestType, "Event id not found");
        return;
      }
      if (!eventDetails) {
        toastError(requestType, "Event details not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        eventId: originalEventId,
        ...eventDetails,
        requestType,
      });
      break;

    case "edit_ao_and_location": // Edit AO details, Edit AO and Location
      if (!originalRegionId) {
        toastError(requestType, "Region id not found");
        return;
      }
      if (!originalAoId) {
        toastError(requestType, "AO id not found");
        return;
      }
      if (!originalLocationId) {
        toastError(requestType, "Location id not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        originalLocationId,
        originalAoId,
        ...eventDetails,
        ...locationDetails,
        requestType,
      });
      break;

    case "move_ao_to_different_region": // Move to different region
      if (!originalRegionId) {
        toastError(requestType, "Original region id not found");
        return;
      }
      if (!originalAoId) {
        toastError(requestType, "Original AO id not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        originalAoId,
        originalLocationId,
        requestType,
      });
      break;

    case "move_ao_to_different_location":
      throw new Error("Not implemented yet");

    case "move_event_to_different_ao": // Move to different AO, Move Workout to Different AO
      if (!originalRegionId) {
        toastError(requestType, "Region id not found");
        return;
      }
      if (!originalEventId) {
        toastError(requestType, "Event id not found");
        return;
      }
      if (!originalAoId) {
        toastError(requestType, "AO id not found");
        return;
      }

      openModal(ModalType.UPDATE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        originalRegionId,
        originalAoId,
        eventId: originalEventId,
        requestType,
      });
      break;

    case "delete_ao":
      if (!originalAoId) {
        toastError(requestType, "AO id not found");
        return;
      }
      openModal(ModalType.DELETE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        aoId: originalAoId,
        regionId: originalRegionId,
        requestType,
      });
      break;
    case "delete_event":
      if (!originalEventId) {
        toastError(requestType, "AO id not found");
        return;
      }
      openModal(ModalType.DELETE, {
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        eventId: originalEventId,
        regionId: originalRegionId,
        requestType,
      });
      break;

    // Legacy
    case "edit":
      if (!originalRegionId) {
        toastError(requestType, "Region id not found");
        return;
      }
      if (!originalAoId) {
        toastError(requestType, "AO id not found");
        return;
      }
      if (!originalLocationId) {
        toastError(requestType, "Location id not found");
        return;
      }
      openModal(ModalType.UPDATE, {
        requestType,
        ...OPEN_REQUEST_MODAL_DEFAULTS,
        ...eventDetails,
        ...locationDetails,
        originalRegionId,
        originalAoId,
        originalLocationId,
      });
      break;

    default:
      throw new Error("Not implemented");
  }
};

const OPEN_REQUEST_MODAL_DEFAULTS = {
  locationId: null,
  eventId: null,
  aoId: null,
  aoName: null,
  aoLogo: null,
  aoWebsite: null,
  eventTypeIds: null,
  eventDescription: null,
  startTime: null,
  workoutName: null,
  lat: null,
  lng: null,
  endTime: null,
  dayOfWeek: null,
  locationAddress: null,
  locationAddress2: null,
  locationCity: null,
  locationState: null,
  locationZip: null,
  locationCountry: null,
  locationDescription: null,
  regionId: null,
  regionWebsite: null,
  originalRegionId: null,
  originalAoId: null,
  originalLocationId: null,
};

const toastError = (requestType: RequestType, message: string) => {
  toast.error(`${requestType}, ${requestTypeToTitle(requestType)}: ${message}`);
};
