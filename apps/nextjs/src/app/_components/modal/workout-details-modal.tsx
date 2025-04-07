import { useRouter } from "next/navigation";
import { useWindowWidth } from "@react-hook/window-size";
import { useSession } from "next-auth/react";

import { BreakPoints, Z_INDEX } from "@acme/shared/app/constants";
import { Dialog, DialogContent, DialogHeader } from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { vanillaApi } from "~/trpc/vanilla";
import { closeModal, modalStore } from "~/utils/store/modal";
import { selectedItemStore } from "~/utils/store/selected-item";
import { WorkoutDetailsContent } from "../workout/workout-details-content";

export const WorkoutDetailsModal = ({
  data,
}: {
  data: DataType[ModalType.WORKOUT_DETAILS];
}) => {
  const utils = api.useUtils();
  const router = useRouter();
  const { data: session } = useSession();
  const selectedLocationId = selectedItemStore.use.locationId();
  const selectedEventId = selectedItemStore.use.eventId();
  const providedLocationId =
    typeof data.locationId === "number" ? data.locationId : -1;
  const locationId = selectedLocationId ?? providedLocationId;
  const { data: results, isLoading } = api.location.getAoWorkoutData.useQuery(
    { locationId },
    { enabled: locationId >= 0 },
  );
  const width = useWindowWidth();
  const isLarge = width > Number(BreakPoints.LG);
  const isMedium = width > Number(BreakPoints.MD);

  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:rounded-none lg:px-8"
      >
        <DialogHeader className="flex flex-row flex-wrap items-center justify-start gap-x-2">
          {/* Empty DialogHeader to maintain structure */}
        </DialogHeader>

        <WorkoutDetailsContent
          results={results}
          isLoading={isLoading}
          selectedEventId={selectedEventId}
          chipSize={isLarge ? "large" : isMedium ? "medium" : "large"}
          onDeleteClick={() => {
            if (!results?.location.regionId || !selectedEventId) return;

            const event = results.location.events.find(
              (e) => e.eventId === selectedEventId,
            );
            if (!event) return;

            void vanillaApi.request.submitDeleteRequest
              .mutate({
                regionId: results.location.regionId,
                eventId: event.eventId,
                eventName: event.eventName,
                submittedBy: session?.user?.email ?? "",
              })
              .then((result) => {
                void utils.location.invalidate();
                router.refresh();
                toast.success(
                  result.status === "pending"
                    ? "Delete request submitted"
                    : "Successfully deleted event",
                );
                // Close all modals
                modalStore.setState({ modals: [] });
              });
          }}
        />

        <div className="h-2" />
        <div className="flex w-full flex-col justify-center gap-4">
          <button
            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md bg-muted-foreground px-2 py-1 text-background"
            onClick={() => closeModal()}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
