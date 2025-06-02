import { AODetailsForm } from "../form-inputs/ao-details-form";
import { EventSelectionForm } from "../form-inputs/event-selection-form";
import { LocationDetailsForm } from "../form-inputs/location-details-form";

export const MoveEventToNewLocationForm = () => {
  return (
    <>
      <EventSelectionForm />
      <AODetailsForm />
      <LocationDetailsForm />
    </>
  );
};
