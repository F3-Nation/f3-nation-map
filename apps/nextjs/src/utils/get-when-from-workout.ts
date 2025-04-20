import dayjs from "dayjs";

import type { DayOfWeek } from "@acme/shared/app/enums";
import {
  START_END_TIME_DB_FORMAT,
  START_END_TIME_DISPLAY_FORMAT,
} from "@acme/shared/app/constants";
import { getReadableDayOfWeek } from "@acme/shared/app/functions";

export const getWhenFromWorkout = (params: {
  startTime: string | null;
  endTime: string | null;
  dayOfWeek: DayOfWeek | null;
  condensed?: boolean;
}) => {
  const event = params;
  const condensed = params.condensed ?? false;
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, START_END_TIME_DB_FORMAT).format(
          START_END_TIME_DISPLAY_FORMAT,
        );

  const startTime = !condensed
    ? startTimeRaw
    : startTimeRaw?.replace(":00", "");

  const endTime = dayjs(event.endTime, START_END_TIME_DB_FORMAT).format(
    START_END_TIME_DISPLAY_FORMAT,
  );

  const duration = dayjs(event.endTime, START_END_TIME_DB_FORMAT).diff(
    dayjs(event.startTime, START_END_TIME_DB_FORMAT),
    "minutes",
  );
  return `${getReadableDayOfWeek(event.dayOfWeek)} ${startTime} - ${endTime} (${duration}min)`;
};
