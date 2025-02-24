"use client";

import { useWindowSize } from "@react-hook/window-size";

import { BreakPoints } from "@f3/shared/app/constants";

import type { DataType } from "~/utils/store/modal";
import { ModalType, useOpenModal } from "~/utils/store/modal";
import AdminAOsModal from "./admin-aos-modal";
import AdminAreasModal from "./admin-areas-modal";
import AdminLocationsModal from "./admin-locations-modal";
import AdminNationsModal from "./admin-nations-modal";
import AdminRegionsModal from "./admin-regions-modal";
import AdminRequestsModal from "./admin-requests-modal";
import AdminSectorsModal from "./admin-sectors-modal";
import AdminUsersModal from "./admin-users-modal";
import AdminWorkoutsModal from "./admin-workouts-modal";
import DeleteModal from "./delete-modal";
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
    case ModalType.ADMIN_NATIONS:
      return (
        <AdminNationsModal data={data as DataType[ModalType.ADMIN_NATIONS]} />
      );
    case ModalType.ADMIN_SECTORS:
      return (
        <AdminSectorsModal data={data as DataType[ModalType.ADMIN_SECTORS]} />
      );
    case ModalType.ADMIN_AREAS:
      return <AdminAreasModal data={data as DataType[ModalType.ADMIN_AREAS]} />;
    case ModalType.ADMIN_REGIONS:
      return (
        <AdminRegionsModal data={data as DataType[ModalType.ADMIN_REGIONS]} />
      );
    case ModalType.ADMIN_AOS:
      return <AdminAOsModal data={data as DataType[ModalType.ADMIN_AOS]} />;
    case ModalType.ADMIN_DELETE_CONFIRMATION:
      return (
        <DeleteModal
          data={data as DataType[ModalType.ADMIN_DELETE_CONFIRMATION]}
        />
      );
    default:
      return null;
  }
}
