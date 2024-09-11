import { DebugInfo } from "./map/debug-info";
import DesktopSelectedItem from "./map/desktop-selected-item";
import { MobileAllFilters } from "./map/mobile-all-filters";
import { MobileFilterButton } from "./map/mobile-filter-button";
import { MobileSearchResults } from "./map/mobile-search-results";
import { UserLocationIcon } from "./map/user-location-icon";
import { ZoomAndTileButtons } from "./map/zoom-and-tile-buttons";

const SHOW_DEBUG = false;
export const MapLayoutItems = () => {
  return (
    <>
      <UserLocationIcon />
      <ZoomAndTileButtons />
      <MobileFilterButton />
      <DesktopSelectedItem />
      <MobileSearchResults />
      <MobileAllFilters />
      {process.env.NODE_ENV !== "development" ? null : (
        <>{SHOW_DEBUG && <DebugInfo />}</>
      )}
    </>
  );
};
