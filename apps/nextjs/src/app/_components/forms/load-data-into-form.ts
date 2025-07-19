import { v4 as uuid } from "uuid";

import { convertHHmmToHH_mm } from "@acme/shared/app/functions";

import type { useDeleteForm, useUpdateForm } from "~/utils/forms";
import type { DataType, ModalType } from "~/utils/store/modal";
import { appStore } from "~/utils/store/app";

type UpdateForm = ReturnType<typeof useUpdateForm>;
type DeleteForm = ReturnType<typeof useDeleteForm>;

export const loadDataIntoUpdateForm = (
  form: UpdateForm,
  data: DataType[ModalType.UPDATE],
) => {
  console.log("loadDataIntoUpdateForm", data);
  form.setValue("id", uuid());
  form.setValue("requestType", data.requestType);
  form.setValue("regionId", data.regionId);

  form.setValue("locationId", data.locationId ?? null);
  form.setValue("locationAddress", data.locationAddress ?? "");
  form.setValue("locationAddress2", data.locationAddress2 ?? "");
  form.setValue("locationCity", data.locationCity ?? "");
  form.setValue("locationState", data.locationState ?? "");
  form.setValue("locationZip", data.locationZip ?? "");
  form.setValue("locationCountry", data.locationCountry ?? "");
  form.setValue("locationLat", data.lat);
  form.setValue("locationLng", data.lng);
  form.setValue("locationDescription", data.locationDescription ?? "");

  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  form.setValue("eventId", data.eventId ?? null);
  form.setValue("eventName", data.workoutName ?? "");
  // startTime: convertHHmmToHH_mm(event?.startTime ?? ""),
  // endTime: convertHHmmToHH_mm(event?.endTime ?? ""),
  form.setValue(
    "eventStartTime",
    data.startTime ? convertHHmmToHH_mm(data.startTime) : undefined,
  );
  form.setValue(
    "eventEndTime",
    data.endTime ? convertHHmmToHH_mm(data.endTime) : undefined,
  );
  form.setValue("eventDescription", data.eventDescription ?? "");
  form.setValue("eventDayOfWeek", data.dayOfWeek ?? null);
  form.setValue("eventTypeIds", data.eventTypeIds ?? null);

  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.originalAoId);
  form.setValue("originalLocationId", data.originalLocationId);
};

export const loadDataIntoDeleteForm = (
  form: DeleteForm,
  data: DataType[ModalType.DELETE],
) => {
  if (!data.regionId) {
    throw new Error("regionId is required");
  }
  console.log("loadDataIntoDeleteForm", data);
  form.setValue("requestType", data.requestType);
  form.setValue("eventId", data.eventId ?? null);
  form.setValue("originalRegionId", data.regionId);
  form.setValue("originalAoId", data.aoId);
  form.setValue("submittedBy", appStore.get("myEmail"));
};

// TODO: remove data that aren't needed
export const loadDataIntoAOEditForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.AO_EDIT],
) => {
  console.log("loadDataIntoAOEditForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "edit_ao_and_location");
  form.setValue("regionId", data.originalRegionId);
  form.setValue("badImage", false);

  // // Set location fields
  form.setValue("locationId", data.locationId ?? null);
  form.setValue("locationAddress", data.locationAddress ?? "");
  form.setValue("locationAddress2", data.locationAddress2 ?? "");
  form.setValue("locationCity", data.locationCity ?? "");
  form.setValue("locationState", data.locationState ?? "");
  form.setValue("locationZip", data.locationZip ?? "");
  form.setValue("locationCountry", data.locationCountry ?? "United States");
  form.setValue("locationLat", data.lat);
  form.setValue("locationLng", data.lng);
  form.setValue("locationDescription", data.locationDescription ?? "");

  // // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.aoId);
  form.setValue("originalLocationId", data.locationId);
};

// TODO: remove data that aren't needed
export const loadDataIntoEventForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.EVENT_EDIT],
) => {
  console.log("loadDataIntoEventForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "edit_event");
  form.setValue("regionId", data.originalRegionId);
  form.setValue("badImage", false);

  // Set event fields
  form.setValue("eventId", data.eventId ?? null);
  form.setValue("eventName", data.workoutName ?? "");
  form.setValue(
    "eventStartTime",
    data.startTime ? convertHHmmToHH_mm(data.startTime) : undefined,
  );
  form.setValue(
    "eventEndTime",
    data.endTime ? convertHHmmToHH_mm(data.endTime) : undefined,
  );
  form.setValue("eventDescription", data.eventDescription ?? "");
  form.setValue("eventDayOfWeek", data.dayOfWeek ?? null);
  form.setValue("eventTypeIds", data.eventTypeIds ?? []);

  // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.originalAoId);
  form.setValue("originalLocationId", data.originalLocationId);
};

// TODO: remove data that aren't needed
export const loadDataIntoCreateEventForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.CREATE_EVENT],
) => {
  console.log("loadDataIntoCreateEventForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "create_event");
  form.setValue("regionId", data.originalRegionId);
  form.setValue("badImage", false);

  // Set location fields
  form.setValue("locationId", data.locationId ?? null);
  form.setValue("locationLat", data.lat ?? null);
  form.setValue("locationLng", data.lng ?? null);

  // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.aoId);
  form.setValue("originalLocationId", data.locationId);
};

// TODO: remove data that aren't needed
export const loadDataIntoCreateLocationAndEventForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.CREATE_LOCATION_AND_EVENT],
) => {
  console.log("loadDataIntoCreateLocationAndEventForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "create_location_and_event");
  form.setValue("regionId", data.originalRegionId);
  form.setValue("badImage", false);

  // Set location fields
  form.setValue("locationId", data.locationId ?? null);
  form.setValue("locationLat", data.lat ?? null);
  form.setValue("locationLng", data.lng ?? null);
  form.setValue("locationAddress", data.locationAddress ?? "");
  form.setValue("locationAddress2", data.locationAddress2 ?? "");
  form.setValue("locationCity", data.locationCity ?? "");
  form.setValue("locationState", data.locationState ?? "");
  form.setValue("locationZip", data.locationZip ?? "");
  form.setValue("locationCountry", data.locationCountry ?? "United States");
  form.setValue("locationDescription", data.locationDescription ?? "");

  form.setValue("eventName", data.workoutName ?? "");
  form.setValue("eventDayOfWeek", data.dayOfWeek ?? null);
  form.setValue(
    "eventStartTime",
    data.startTime ? convertHHmmToHH_mm(data.startTime) : undefined,
  );
  form.setValue(
    "eventEndTime",
    data.endTime ? convertHHmmToHH_mm(data.endTime) : undefined,
  );
  form.setValue("eventDescription", data.eventDescription ?? "");
  form.setValue("eventTypeIds", data.eventTypeIds ?? []);

  // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.originalAoId);
  form.setValue("originalLocationId", data.locationId);
};

// TODO: remove data that aren't needed
export const loadDataIntoMoveAOToNewLocationForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.MOVE_AO_TO_NEW_LOCATION],
) => {
  console.log("loadDataIntoMoveAOToNewLocationForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "move_ao_to_new_location");
  form.setValue("regionId", data.regionId);
  form.setValue("badImage", false);

  // Set location fields
  form.setValue("locationId", data.locationId ?? null);
  form.setValue("locationLat", data.lat ?? null);
  form.setValue("locationLng", data.lng ?? null);
  form.setValue("locationAddress", data.locationAddress ?? "");
  form.setValue("locationAddress2", data.locationAddress2 ?? "");
  form.setValue("locationCity", data.locationCity ?? "");
  form.setValue("locationState", data.locationState ?? "");
  form.setValue("locationZip", data.locationZip ?? "");
  form.setValue("locationCountry", data.locationCountry ?? "United States");
  form.setValue("locationDescription", data.locationDescription ?? "");

  // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.originalAoId);
  form.setValue("originalLocationId", data.originalLocationId);
};

// TODO: remove data that aren't needed
export const loadDataIntoMoveEventToNewLocationForm = (
  form: ReturnType<typeof useUpdateForm>,
  data: DataType[ModalType.MOVE_EVENT_TO_NEW_LOCATION],
) => {
  console.log("loadDataIntoMoveEventToNewLocationForm", data);
  form.setValue("id", uuid());

  // Set basic form values
  form.setValue("requestType", "move_event_to_new_location");
  form.setValue("regionId", data.regionId);
  form.setValue("badImage", false);

  // Set location fields
  form.setValue("locationLat", data.lat ?? null);
  form.setValue("locationLng", data.lng ?? null);
  form.setValue("locationAddress", data.locationAddress ?? "");
  form.setValue("locationAddress2", data.locationAddress2 ?? "");
  form.setValue("locationCity", data.locationCity ?? "");
  form.setValue("locationState", data.locationState ?? "");
  form.setValue("locationZip", data.locationZip ?? "");
  form.setValue("locationCountry", data.locationCountry ?? "United States");
  form.setValue("locationDescription", data.locationDescription ?? "");

  // Set AO fields
  form.setValue("aoId", data.aoId ?? null);
  form.setValue("aoName", data.aoName ?? "");
  form.setValue("aoLogo", data.aoLogo ?? "");
  form.setValue("aoWebsite", data.aoWebsite ?? "");

  // Set event fields
  form.setValue("eventId", data.eventId ?? null);

  // Set contact and original values
  form.setValue("submittedBy", appStore.get("myEmail"));
  form.setValue("originalRegionId", data.originalRegionId);
  form.setValue("originalAoId", data.originalAoId);
  form.setValue("originalLocationId", data.originalLocationId);
};
