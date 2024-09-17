import { DebugInfo } from "./map/debug-info";
import DesktopSelectedItem from "./map/desktop-selected-item";
import { MapSearchBoxMobile } from "./map/map-searchbox-mobile";
import { MobileAllFilters } from "./map/mobile-all-filters";
import { MobileFilterButtons } from "./map/mobile-filter-buttons";
import { MobileNearbyLocations } from "./map/mobile-nearby-locations";
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
      <MobileNearbyLocations />
      <MobileAllFilters />
      <MapSearchBoxMobile />
      <MobileSearchResults />
      {process.env.NODE_ENV !== "development" ? null : (
        <>{SHOW_DEBUG && <DebugInfo />}</>
      )}
    </>
  );
};
