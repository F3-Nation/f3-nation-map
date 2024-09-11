import { ThemeToggle } from "@f3/ui/theme";

import { DebugInfo } from "./map/debug-info";
import DesktopSelectedItem from "./map/desktop-selected-item";
import { MobileSearchResults } from "./map/mobile-search-results";
import { UserLocationIcon } from "./map/user-location-icon";
import { ZoomAndTileButtons } from "./map/zoom-and-tile-buttons";

const SHOW_THEME_TOGGLE = true;
const SHOW_DEBUG = false;
export const MapLayoutItems = () => {
  return (
    <>
      <UserLocationIcon />
      <ZoomAndTileButtons />
      <DesktopSelectedItem />
      <MobileSearchResults />

      {process.env.NODE_ENV !== "development" ? null : (
        <>
          {SHOW_THEME_TOGGLE && (
            <div className="absolute right-16 top-4" style={{ zIndex: 1000 }}>
              <ThemeToggle />
            </div>
          )}
          {SHOW_DEBUG && <DebugInfo />}
        </>
      )}
    </>
  );
};
