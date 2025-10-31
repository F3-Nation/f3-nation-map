import type { RequestType } from "@acme/shared/app/enums";

import { useUpdateFormContext } from "~/utils/forms";
import { AODetailsForm } from "./form-inputs/ao-details-form";
import { DeleteConfirmation } from "./form-inputs/contact-details-form";
import { EventDetailsForm } from "./form-inputs/event-details-form";
import { ExistingLocationPickerForm } from "./form-inputs/existing-location-picker-form";
import { LocationDetailsForm } from "./form-inputs/location-details-form";
import { SelectionForm } from "./form-inputs/selection-form";

interface RequestFormSelectorProps {
  requestType: RequestType;
}

export const RequestFormSelector = ({
  requestType,
}: RequestFormSelectorProps) => {
  const form = useUpdateFormContext();

  // Render the appropriate form based on request type
  switch (requestType) {
    case "edit_ao_and_location":
      return (
        <>
          <AODetailsForm />
          <LocationDetailsForm />
        </>
      );
    case "create_location_and_event":
      return (
        <>
          <SelectionForm
            title="Region Details:"
            includeRegion
            regionLabel="Region"
          />
          <LocationDetailsForm />
          <AODetailsForm />
          <EventDetailsForm />
        </>
      );
    case "create_event":
      return <EventDetailsForm />;
    case "edit_event":
      return <EventDetailsForm />;
    case "edit":
      form.watch("eventId");
      return form.watch("eventId") ? (
        // Event editing requires event fields
        <EventDetailsForm />
      ) : (
        // AO/Location editing without event
        <>
          <AODetailsForm />
          <LocationDetailsForm />
        </>
      );
    case "move_ao_to_different_region":
      return (
        <SelectionForm
          title="Region Details:"
          includeRegion
          regionLabel="Region"
        />
      );
    case "move_ao_to_new_location":
      return (
        <>
          <SelectionForm
            title="Choose AO:"
            includeRegion
            includeAO
            regionLabel="In Region:"
            aoLabel="AO to move:"
          />
          <LocationDetailsForm />
        </>
      );
    case "move_ao_to_different_location":
      return <ExistingLocationPickerForm />;
    case "move_event_to_different_ao":
      return (
        <SelectionForm
          title="Destination AO"
          includeRegion
          includeAO
          regionLabel="In Region:"
          aoLabel="To AO"
        />
      );
    case "move_event_to_new_location":
      return (
        <>
          <SelectionForm
            title="Event to move"
            includeRegion
            includeAO
            includeEvent
            regionLabel="In Region:"
            aoLabel="From AO (optional):"
            eventLabel="Event to move"
          />
          <LocationDetailsForm />
        </>
      );
    case "delete_event":
      return <DeleteConfirmation type="event" />;
    case "delete_ao":
      return <DeleteConfirmation type="ao" />;
    default:
      return <div>Unknown request type: {requestType}</div>;
  }
};
