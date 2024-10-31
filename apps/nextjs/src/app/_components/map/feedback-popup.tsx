import { Popup } from "react-leaflet";

import { classNames } from "@f3/shared/common/functions";
import { useMediaQuery } from "@f3/shared/common/hooks";
import { useTheme } from "@f3/ui/theme";

import { mapStore } from "~/utils/store/map";
import { ModalType, useModalStore } from "~/utils/store/modal";

const FeedbackPopup = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { nearbyUsers } = mapStore.use.expansionNearbyUsers();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Popup
      autoPan={false}
      offset={[0, -5]}
      className={classNames(
        "pointer-events-auto z-[9999] rounded-lg opacity-70",
        isDesktop ? "w-[350px]" : "w-[390px]",
      )}
    >
      <div
        className={classNames(
          "flex h-[calc(100%-76px)] flex-col gap-4 px-4 py-6 text-center [&_]:whitespace-normal [&_]:break-normal [&_p]:!m-0",
          isDark ? "bg-black text-white" : "bg-white text-black",
          isDesktop ? "w-[350px]" : "min-w-[280px]",
        )}
      >
        <p className="text-sm">
          No F3 groups found within 20 miles of this area...
        </p>
        <p className="text-base font-bold lg:text-xl">
          You've discovered an oppportunity site!
        </p>
        <button
          className={classNames(
            "cursor-pointer rounded-lg px-4 py-4 text-sm lg:mx-4 lg:text-lg",
            isDark ? "bg-white text-black" : "bg-black text-white",
          )}
          type="button"
          onClick={() => {
            useModalStore.setState({
              open: true,
              type: ModalType.EXPANSION_FORM,
            });
          }}
        >
          Send feedback to have an area F3 group started in this area
        </button>
        <p className="text-sm">
          {nearbyUsers.length} other{" "}
          {nearbyUsers.length > 1 ? "people" : "person"} have expressed interest
          in this area
        </p>
      </div>
    </Popup>
  );
};

export default FeedbackPopup;
