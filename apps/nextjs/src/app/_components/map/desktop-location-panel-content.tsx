import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWindowWidth } from "@react-hook/window-size";
import { isNumber } from "lodash";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

import { BreakPoints } from "@acme/shared/app/constants";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { vanillaApi } from "~/trpc/vanilla";
import { modalStore } from "~/utils/store/modal";
import { closePanel, selectedItemStore } from "~/utils/store/selected-item";
import { WorkoutDetailsContent } from "../workout/workout-details-content";

export const DesktopLocationPanelContent = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: session } = useSession();
  const panelLocationId = selectedItemStore.use.panelLocationId();
  const panelEventId = selectedItemStore.use.panelEventId();

  const open = panelLocationId !== null;
  const locationId = panelLocationId ?? -1;
  const { data: results, isLoading } = api.location.getAoWorkoutData.useQuery(
    { locationId },
    { enabled: locationId >= 0 && open },
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    panelEventId,
  );
  const width = useWindowWidth();
  const isLarge = width > Number(BreakPoints.LG);
  const isMedium = width > Number(BreakPoints.MD);

  useEffect(() => {
    const resultsEventId = results?.location.events[0]?.eventId;
    if (isNumber(resultsEventId)) {
      setSelectedEventId(resultsEventId);
    }
  }, [results]);

  useEffect(() => {
    setSelectedEventId(panelEventId);
  }, [panelEventId]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto relative flex flex-col rounded-lg bg-background p-4 shadow dark:border">
      <WorkoutDetailsContent
        results={results}
        isLoading={isLoading}
        selectedEventId={selectedEventId}
        chipSize={isLarge ? "large" : isMedium ? "medium" : "small"}
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

      <div className="h-8" />
      <div className="absolute right-2 top-2 flex flex-row gap-2">
        <button
          className="rounded-full bg-muted-foreground px-1 py-1 text-sm text-background"
          onClick={(e) => {
            closePanel();
            e.stopPropagation();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
