import { Z_INDEX } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import { Spinner } from "@f3/ui/spinner";

import { api } from "~/trpc/react";
import { ModalType, useModalStore } from "~/utils/store/modal";

export const WorkoutDetailsModal = () => {
  const { open, data } = useModalStore();
  const eventId = typeof data.eventId === "number" ? data.eventId : -1;
  const { data: workout, isLoading } =
    api.location.getIndividualWorkoutData.useQuery(
      { eventId },
      { enabled: eventId >= 0 },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={() => useModalStore.setState({ open: false })}
    >
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        // min of 90% and 600px
        className={cn(`max-w-[calc(min(90%,600px))]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center"></DialogTitle>
        </DialogHeader>
        {!workout || isLoading ? (
          <Spinner />
        ) : (
          <>
            <div>{JSON.stringify(workout)}</div>
            <div>{workout.dayOfWeek}</div>
            <div>{workout.locationDescription}</div>
            <div>{workout.locationAddress}</div>
            <Button
              onClick={() => {
                useModalStore.setState({ type: ModalType.HOW_TO_JOIN });
              }}
            >
              How to join
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
