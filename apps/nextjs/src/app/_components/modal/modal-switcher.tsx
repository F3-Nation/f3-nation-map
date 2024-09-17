"use client";

import { ModalType, useModalStore } from "~/utils/store/modal";
import HowToJoinModal from "./how-to-join-modal";
import UserLocationInfoModal from "./user-location-info-modal";
import { WorkoutDetailsModal } from "./workout-details-modal";

export default function ModalSwitcher() {
  const { type } = useModalStore();

  switch (type) {
    case ModalType.HOW_TO_JOIN:
      return <HowToJoinModal />;
    case ModalType.USER_LOCATION_INFO:
      return <UserLocationInfoModal />;
    case ModalType.WORKOUT_DETAILS:
      return <WorkoutDetailsModal />;
    default:
      return null;
  }
}
