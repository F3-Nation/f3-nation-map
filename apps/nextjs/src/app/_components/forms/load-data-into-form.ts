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
