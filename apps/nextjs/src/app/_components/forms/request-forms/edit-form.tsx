import { useUpdateFormContext } from "~/utils/forms";
import { AODetailsForm } from "../form-inputs/ao-details-form";
import { EventDetailsForm } from "../form-inputs/event-details-form";
import { LocationDetailsForm } from "../form-inputs/location-details-form";

export const EditForm = () => {
  const form = useUpdateFormContext();
  const formEventId = form.watch("eventId");

  // Define required fields for edit - this will be adapted based on what's edited

  if (formEventId) {
    // Event editing requires event fields
    return (
      <>
        <EventDetailsForm />
      </>
    );
  }

  // AO/Location editing without event
  return (
    <>
      <AODetailsForm />
      <LocationDetailsForm />
    </>
  );
};
