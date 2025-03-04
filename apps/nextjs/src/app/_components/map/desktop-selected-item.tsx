"use client";

import { useEffect, useMemo, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";

import {
  SELECTED_ITEM_DEBOUNCE_TIME_MS,
  Z_INDEX,
} from "@acme/shared/app/constants";
import { cn } from "@acme/ui";

import { api } from "~/trpc/react";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { SelectedItem } from "./selected-item";
import { useSelectedItem } from "./use-selected-item";

const SelectedItemWrapper = () => {
  const hideSelectedItem = selectedItemStore.use.hideSelectedItem();
  const dragging = mapStore.use.dragging();
  const selectedItem = useSelectedItem();
  // const previousSelectedLocationId = useRef(selectedItem.selectedLocation?.id);
  const utils = api.useUtils();

  const [debouncedSelectedItem1, setDebouncedSelectedItem] =
    useState(selectedItem);

  // Create memoized debounced function
  const debouncedSetSelectedItem = useMemo(
    () =>
      debounce((newPosition: typeof selectedItem) => {
        setDebouncedSelectedItem(cloneDeep(newPosition));
      }, SELECTED_ITEM_DEBOUNCE_TIME_MS),
    [],
  );

  // // Update debounced position when pagePosition changes
  useEffect(() => {
    if (typeof selectedItem.selectedLocation?.id === "number") {
      void utils.location.getLocationMarker.prefetch({
        id: selectedItem.selectedLocation?.id,
      });

      // Cancel the previous location marker if it's different from the current one
      // if (
      //   typeof previousSelectedLocationId.current === "number" &&
      //   previousSelectedLocationId.current !== selectedItem.selectedLocation?.id
      // ) {
      //   void utils.location.getLocationMarker.cancel({
      //     id: previousSelectedLocationId.current,
      //   });
      // }
    }

    debouncedSetSelectedItem(selectedItem);

    // Cleanup
    return () => {
      debouncedSetSelectedItem.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedItem object doesn't change but the properties do
  }, [
    selectedItem.pagePosition,
    selectedItem.selectedLocation,
    selectedItem.selectedEvent,
    debouncedSetSelectedItem,
  ]);

  if (
    !debouncedSelectedItem1.selectedLocation ||
    !debouncedSelectedItem1.selectedEvent ||
    dragging
  ) {
    return null;
  }

  return (
    <div
      className={cn("absolute hidden lg:block", {
        "lg:hidden": hideSelectedItem,
      })}
      style={{
        zIndex: Z_INDEX.SELECTED_ITEM_CONTAINER_DESKTOP,
        top: debouncedSelectedItem1.pagePosition?.y,
        left: debouncedSelectedItem1.pagePosition?.x,
        transform: "translate(-50%, 5px)",
      }}
    >
      <SelectedItem
        selectedLocation={debouncedSelectedItem1.selectedLocation}
        selectedEvent={debouncedSelectedItem1.selectedEvent}
        hideCloseButton
      />
    </div>
  );
};

export default SelectedItemWrapper;
