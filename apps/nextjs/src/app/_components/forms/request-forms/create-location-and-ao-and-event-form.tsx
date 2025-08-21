import { AODetailsForm } from "../form-inputs/ao-details-form";
import { EventDetailsForm } from "../form-inputs/event-details-form";
import { LocationDetailsForm } from "../form-inputs/location-details-form";
import { RegionSelectionForm } from "../form-inputs/region-selection-form";

export const CreateLocationAndAOAndEventForm = () => {
  return (
    <>
      <RegionSelectionForm />
      <LocationDetailsForm />
      <AODetailsForm />
      <EventDetailsForm />
    </>
  );
};
