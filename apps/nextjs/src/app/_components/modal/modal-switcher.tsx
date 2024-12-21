"use client";

import { useWindowSize } from "@react-hook/window-size";

import { BreakPoints } from "@f3/shared/app/constants";

import { ModalType, useModalStore } from "~/utils/store/modal";
import HowToJoinModal from "./how-to-join-modal";
import { MapInfoModal } from "./map-info-modal";
import { UpdateLocationModal } from "./update-location-modal";
import UserLocationInfoModal from "./user-location-info-modal";
import { WorkoutDetailsModal } from "./workout-details-modal";

export default function ModalSwitcher() {
  const { type } = useModalStore();
  const [width] = useWindowSize();

  switch (type) {
    case ModalType.HOW_TO_JOIN:
      return <HowToJoinModal />;
    case ModalType.USER_LOCATION_INFO:
      return <UserLocationInfoModal />;
    case ModalType.UPDATE_LOCATION:
      return <UpdateLocationModal />;
    case ModalType.WORKOUT_DETAILS:
      // Hide on desktop
      return width >= Number(BreakPoints.LG) ? null : <WorkoutDetailsModal />;
    case ModalType.INFO:
      return <MapInfoModal />;
    default:
      return null;
  }
}
