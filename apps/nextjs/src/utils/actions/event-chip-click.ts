import { isTouchDevice } from "../is-touch-device";
import { ModalType, openModal } from "../store/modal";
import { openPanel } from "../store/selected-item";

export const eventChipClick = ({
  locationId,
  eventId,
}: {
  locationId?: number | null;
  eventId?: number | null;
}) => {
  const isMobile = isTouchDevice();
  if (isMobile) {
    openPanel({ locationId, eventId });
  } else {
    openModal(ModalType.WORKOUT_DETAILS, { locationId, eventId });
  }
};
