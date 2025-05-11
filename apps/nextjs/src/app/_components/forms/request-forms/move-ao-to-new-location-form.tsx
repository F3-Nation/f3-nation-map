import { AOSelectionForm } from "../form-inputs/ao-selection-form";
import { LocationDetailsForm } from "../form-inputs/location-details-form";
import { RegionSelectionForm } from "../form-inputs/region-selection-form";

export const MoveAOToNewLocationForm = () => {
  return (
    <>
      <RegionSelectionForm />
      <AOSelectionForm />
      <LocationDetailsForm />
    </>
  );
};
