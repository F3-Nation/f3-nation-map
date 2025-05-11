import { AOSelectionForm } from "../form-inputs/ao-selection-form";
import { EventSelectionForm } from "../form-inputs/event-selection-form";
import { LocationDetailsForm } from "../form-inputs/location-details-form";
import { RegionSelectionForm } from "../form-inputs/region-selection-form";

export const MoveEventToNewLocationForm = () => {
  return (
    <>
      <RegionSelectionForm />
      <AOSelectionForm />
      <EventSelectionForm />
      <LocationDetailsForm />
    </>
  );
};
