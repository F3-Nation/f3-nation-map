import { DebugInfo } from "./map/debug-info";
import DesktopSelectedItem from "./map/desktop-selected-item";
import { MobileAllFilters } from "./map/mobile-all-filters";
import { MobileFilterButtons } from "./map/mobile-filter-buttons";
import { MobileSearchResults } from "./map/mobile-search-results";
import { UserLocationIcon } from "./map/user-location-icon";
import { ZoomAndTileButtons } from "./map/zoom-and-tile-buttons";

const SHOW_DEBUG = false;
export const MapLayoutItems = () => {
  return (
    <>
      <UserLocationIcon />
      <ZoomAndTileButtons />
      <MobileFilterButtons />
      <DesktopSelectedItem />
      <MobileSearchResults />
      <MobileAllFilters />
      {process.env.NODE_ENV !== "development" ? null : (
        <>{SHOW_DEBUG && <DebugInfo />}</>
      )}
    </>
  );
};
