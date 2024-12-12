"use client";

import type { ComponentProps } from "react";

import { Z_INDEX } from "@f3/shared/app/constants";

import { mapStore } from "~/utils/store/map";
import { DebugInfo } from "./map/debug-info";
import { DesktopFilterButtons } from "./map/desktop-filter-buttons";
import { DesktopLocationPanelContent } from "./map/desktop-location-panel-content";
import DesktopSelectedItem from "./map/desktop-selected-item";
import { HelpButton } from "./map/help-button";
import { MapSearchBoxMobile } from "./map/map-searchbox-mobile";
import { MobileAllFilters } from "./map/mobile-all-filters";
import { MobileFilterButtons } from "./map/mobile-filter-buttons";
import { MobileSearchResultsAndNearbyLocations } from "./map/mobile-search-results-and-nearby-locations";
import { MobileSelectedItem } from "./map/mobile-selected-item";
import { TileButton } from "./map/tile-button";
import { UserLocationIcon } from "./map/user-location-icon";
import { ZoomButtons } from "./map/zoom-buttons";

const SHOW_DEBUG = false;
export const MapLayoutItems = () => {
  const showDebugStore = mapStore.use.showDebug();
  const loaded = mapStore.use.loaded();

  const showDebug =
    showDebugStore || (process.env.NODE_ENV === "development" && SHOW_DEBUG)
      ? true
      : false;
  return (
    <>
      {loaded && (
        <DesktopTopLeftButtons>
          <HelpButton />
          <DesktopFilterButtons />
        </DesktopTopLeftButtons>
      )}
      <DesktopTopRightButtons></DesktopTopRightButtons>
      {loaded && (
        <DesktopBottomLeftButtons>
          <TileButton />
        </DesktopBottomLeftButtons>
      )}
      <DesktopBottomRightButtons>
        <UserLocationIcon />
        <ZoomButtons />
      </DesktopBottomRightButtons>
      <DesktopSelectedItem />
      <DesktopLocationPanel>
        <DesktopLocationPanelContent />
      </DesktopLocationPanel>

      {/* Mobile */}
      <MobileAboveSearchBox>
        <div className="mb-1 flex w-full flex-row items-end justify-between px-1">
          <TileButton className="size-9" />
          <UserLocationIcon />
        </div>
        <div className="mb-[2px] flex flex-row gap-2 overflow-auto px-2 pb-[6px]">
          <HelpButton />
          <MobileFilterButtons />
        </div>
        <MobileSelectedItem />
      </MobileAboveSearchBox>
      <MobileTopRightButtons>
        <ZoomButtons />
      </MobileTopRightButtons>
      <MobileAllFilters />
      <MobileSearchResultsAndNearbyLocations />
      <MapSearchBoxMobile />
      {showDebug ? <DebugInfo /> : null}
    </>
  );
};
const DesktopTopLeftButtons = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    className="absolute left-2 top-2 hidden flex-row gap-1 lg:flex"
    {...props}
  />
);

const DesktopTopRightButtons = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    className="absolute right-2 top-2 hidden flex-col gap-1 lg:flex"
    {...props}
  />
);

const DesktopBottomLeftButtons = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    className="absolute bottom-2 left-2 hidden flex-col gap-1 lg:flex"
    {...props}
  />
);

const DesktopBottomRightButtons = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    className="absolute bottom-2 right-2 hidden flex-col gap-1 lg:flex"
    {...props}
  />
);

const DesktopLocationPanel = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.LOCATION_PANEL }}
    // max-w-md must match to MAX_DESKTOP_WORKOUT_PANEL_WIDTH
    className="scrollbar-hide pointer-events-none absolute bottom-0 left-2 top-0 hidden w-1/2 max-w-md overflow-y-auto pb-2 pt-12 lg:block"
    {...props}
  />
);

const MobileAboveSearchBox = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    // 46px and 6px to keep the slider in the middle between them
    className="absolute bottom-[44px] left-0 right-0 block lg:hidden"
    {...props}
  />
);

const MobileTopRightButtons = (props: ComponentProps<"div">) => (
  <div
    style={{ zIndex: Z_INDEX.OVERLAY_BUTTONS }}
    className="absolute right-2 top-2 flex flex-col gap-1 lg:hidden"
    {...props}
  />
);
