"use client";

import { useWindowSize } from "@react-hook/window-size";

import { BreakPoints } from "@f3/shared/app/constants";

import type { DataType } from "~/utils/store/modal";
import { ModalType, useOpenModal } from "~/utils/store/modal";
import AdminLocationsModal from "./admin-locations-modal";
import AdminRegionsModal from "./admin-regions-modal";
import AdminRequestsModal from "./admin-requests-modal";
import AdminUsersModal from "./admin-users-modal";
import AdminWorkoutsModal from "./admin-workouts-modal";
import HowToJoinModal from "./how-to-join-modal";
import { MapInfoModal } from "./map-info-modal";
import SettingsModal from "./settings-modal";
import { UpdateLocationModal } from "./update-location-modal";
import UserLocationInfoModal from "./user-location-info-modal";
import { WorkoutDetailsModal } from "./workout-details-modal";

export default function ModalSwitcher() {
  const modal = useOpenModal();
  const { type, data } = modal ?? {};
  const [width] = useWindowSize();

  switch (type) {
    case ModalType.HOW_TO_JOIN:
      return <HowToJoinModal data={data as DataType[ModalType.HOW_TO_JOIN]} />;
    case ModalType.USER_LOCATION_INFO:
      return <UserLocationInfoModal />;
    case ModalType.UPDATE_LOCATION:
      return (
        <UpdateLocationModal
          data={data as DataType[ModalType.UPDATE_LOCATION]}
        />
      );
    case ModalType.WORKOUT_DETAILS:
      // Hide on desktop
      return width >= Number(BreakPoints.LG) ? null : (
        <WorkoutDetailsModal
          data={data as DataType[ModalType.WORKOUT_DETAILS]}
        />
      );
    case ModalType.INFO:
      return <MapInfoModal />;
    case ModalType.SETTINGS:
      return <SettingsModal />;
    case ModalType.ADMIN_USERS:
      return <AdminUsersModal data={data as DataType[ModalType.ADMIN_USERS]} />;
    case ModalType.ADMIN_REQUESTS:
      return (
        <AdminRequestsModal data={data as DataType[ModalType.ADMIN_REQUESTS]} />
      );
    case ModalType.ADMIN_EVENTS:
      return (
        <AdminWorkoutsModal data={data as DataType[ModalType.ADMIN_EVENTS]} />
      );
    case ModalType.ADMIN_LOCATIONS:
      return (
        <AdminLocationsModal
          data={data as DataType[ModalType.ADMIN_LOCATIONS]}
        />
      );
    case ModalType.ADMIN_REGIONS:
      return (
        <AdminRegionsModal data={data as DataType[ModalType.ADMIN_REGIONS]} />
      );
    default:
      return null;
  }
}
