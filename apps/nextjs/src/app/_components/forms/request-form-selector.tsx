import type { RequestType } from "@acme/shared/app/enums";

import { CreateEventForm } from "./request-forms/create-event-form";
import { CreateLocationAndAOAndEventForm } from "./request-forms/create-location-and-ao-and-event-form";
import { DeleteAOForm } from "./request-forms/delete-ao-form";
import { DeleteEventForm } from "./request-forms/delete-event-form";
import { EditAOAndLocationForm } from "./request-forms/edit-ao-and-location-form";
import { EditEventForm } from "./request-forms/edit-event-form";
import { EditForm } from "./request-forms/edit-form";
import { MoveAOToDifferentLocationForm } from "./request-forms/move-ao-to-different-location-form";
import { MoveAOToDifferentRegionForm } from "./request-forms/move-ao-to-different-region-form";
import { MoveAOToNewLocationForm } from "./request-forms/move-ao-to-new-location-form";
import { MoveEventToDifferentAOForm } from "./request-forms/move-event-to-different-ao-form";
import { MoveEventToNewLocationForm } from "./request-forms/move-event-to-new-location-form";

interface RequestFormSelectorProps {
  requestType: RequestType;
}

export const RequestFormSelector = ({
  requestType,
}: RequestFormSelectorProps) => {
  // Render the appropriate form based on request type
  switch (requestType) {
    case "edit_ao_and_location":
      return <EditAOAndLocationForm />;
    // DOING:currentlychecking this one
    case "create_location_and_event":
      return <CreateLocationAndAOAndEventForm />;
    case "create_event":
      return <CreateEventForm />;
    case "edit_event":
      return <EditEventForm />;
    case "edit":
      return <EditForm />;
    case "move_ao_to_different_region":
      return <MoveAOToDifferentRegionForm />;
    case "move_ao_to_new_location":
      return <MoveAOToNewLocationForm />;
    case "move_ao_to_different_location":
      return <MoveAOToDifferentLocationForm />;
    case "move_event_to_different_ao":
      return <MoveEventToDifferentAOForm />;
    case "move_event_to_new_location":
      return <MoveEventToNewLocationForm />;
    case "delete_event":
      return <DeleteEventForm />;
    case "delete_ao":
      return <DeleteAOForm />;
    default:
      return <div>Unknown request type: {requestType}</div>;
  }
};
