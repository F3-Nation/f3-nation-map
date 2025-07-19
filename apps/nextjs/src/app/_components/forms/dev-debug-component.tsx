import { Button } from "@acme/ui/button";

import { useUpdateFormContext } from "~/utils/forms";

export const DevLoadTestData = () => {
  const form = useUpdateFormContext();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const values = form.getValues();
        !values.eventName && form.setValue("eventName", "Test Event");
        !values.eventDayOfWeek && form.setValue("eventDayOfWeek", "monday");
        !values.submittedBy && form.setValue("submittedBy", "test@test.com");
        !values.aoLogo &&
          form.setValue("aoLogo", "https://placehold.co/640x640");
        !values.aoName && form.setValue("aoName", "Test AO");
        !values.locationAddress &&
          form.setValue("locationAddress", "123 Test St");
        !values.locationAddress2 && form.setValue("locationAddress2", "Apt 1");
        !values.locationCity && form.setValue("locationCity", "Test City");
        !values.locationState && form.setValue("locationState", "CA");
        !values.locationZip && form.setValue("locationZip", "12345");
        !values.locationCountry &&
          form.setValue("locationCountry", "United States");
        !values.eventTypeIds?.length && form.setValue("eventTypeIds", [1]);
        !values.eventStartTime && form.setValue("eventStartTime", "09:00");
        !values.eventEndTime && form.setValue("eventEndTime", "10:00");
        !values.eventDescription &&
          form.setValue("eventDescription", "Test Description");
        !values.locationDescription &&
          form.setValue("locationDescription", "Test Location Description");
        !values.aoWebsite && form.setValue("aoWebsite", "https://test.com");
      }}
    >
      (DEV) Load Test Data
    </Button>
  );
};

export const FormDebugData = () => {
  const form = useUpdateFormContext();
  const formId = form.watch("id");
  const formEventId = form.watch("eventId");
  const formAoId = form.watch("aoId");
  const formRegionId = form.watch("regionId");
  const formLocationId = form.watch("locationId");
  const formOriginalRegionId = form.watch("originalRegionId");
  const formOriginalAoId = form.watch("originalAoId");
  const formOriginalLocationId = form.watch("originalLocationId");
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">formId: {formId};</p>
      <p className="text-sm text-muted-foreground">
        originalRegionId: {formOriginalRegionId};
      </p>
      <p className="text-sm text-muted-foreground">
        originalAoId: {formOriginalAoId};
      </p>
      <p className="text-sm text-muted-foreground">regionId: {formRegionId};</p>
      <p className="text-sm text-muted-foreground">
        originalLocationId: {formOriginalLocationId};
      </p>
      <p className="text-sm text-muted-foreground">aoId: {formAoId};</p>
      <p className="text-sm text-muted-foreground">
        locationId: {formLocationId};
      </p>
      <p className="text-sm text-muted-foreground">eventId: {formEventId}</p>
    </div>
  );
};
