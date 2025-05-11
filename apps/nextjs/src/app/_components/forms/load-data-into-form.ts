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
  form.setValue("id", uuid());
  form.setValue("requestType", data.requestType);
  if (data.regionId != null && data.regionId !== -1) {
    form.setValue("regionId", data.regionId);
  } else {
    // @ts-expect-error -- must remove regionId from form
    form.setValue("regionId", null);
  }

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
  form.setValue("eventStartTime", convertHHmmToHH_mm(data.startTime ?? ""));
  form.setValue("eventEndTime", convertHHmmToHH_mm(data.endTime ?? ""));
  form.setValue("eventDescription", data.eventDescription ?? "");
  form.setValue("eventDayOfWeek", data.dayOfWeek ?? null);
  form.setValue("eventTypeIds", data.eventTypeIds);

  form.setValue("submittedBy", appStore.get("myEmail"));

  form.setValue("originalRegionId", data.regionId);
  form.setValue("originalAoId", data.aoId);
  form.setValue("originalLocationId", data.locationId);
};

export const loadDataIntoDeleteForm = (
  form: DeleteForm,
  data: DataType[ModalType.DELETE],
) => {
  form.setValue("id", uuid());
  form.setValue("requestType", data.requestType);
  if (data.regionId != null && data.regionId !== -1) {
    form.setValue("regionId", data.regionId);
  } else {
    // @ts-expect-error -- must remove regionId from form
    form.setValue("regionId", null);
  }

  form.setValue("aoId", data.aoId ?? null);
  form.setValue("eventId", data.eventId ?? null);
  form.setValue("submittedBy", appStore.get("myEmail"));
};
