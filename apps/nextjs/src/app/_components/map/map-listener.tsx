"use client";

import { useEffect } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import { useMapEvents } from "react-leaflet";

import { BreakPoints } from "@acme/shared/app/constants";
import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { isTouchDevice } from "~/utils/is-touch-device";
import { appStore } from "~/utils/store/app";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";
import { closeModal, modalStore, ModalType } from "~/utils/store/modal";
import { selectedItemStore } from "~/utils/store/selected-item";

/**
 * Hack to listen to map zoom and update the ui based on the zoom level
 * Specifically for the label simulation
 */
export const MapListener = () => {
  RERENDER_LOGS && console.log("MapListener rerender");
  const width = useWindowWidth();

  useEffect(() => {
    appStore.setState({ isMobileDeviceWidth: width < Number(BreakPoints.LG) });
  }, [width]);

  const mapEvents = useMapEvents({
    // This is a hack to get the map ref to update
    click: (e) => {
      console.log("mapEvents click");
      // setSelectedItem({ locationId: null, eventId: null });
      selectedItemStore.setState({
        locationId: null,
        eventId: null,
        // closePanel();
        panelLocationId: null,
        panelEventId: null,
      });
      const [modal] = modalStore.get("modals").slice(-1);
      if (modal?.open && modal?.type === ModalType.WORKOUT_DETAILS) {
        closeModal();
      }
      // Special fn to prevent filtersState from being changed
      filterStore.setState((s) =>
        s.allFilters === true ? { allFilters: false } : s,
      );
      if (appStore.get("mode") === "edit") {
        mapStore.setState({ updateLocation: e.latlng });
      }
    },
    dragstart: () => {
      mapStore.setState({
        dragging: true,
        hasMovedMap: true,
      });
      selectedItemStore.setState({
        locationId: null,
        eventId: null,
      });
    },
    dragend: () => {
      // console.log("mapEvents dragend", JSON.stringify(mapEvents.getBounds()));
      const center = mapEvents.getCenter();
      const bounds = mapEvents.getBounds();
      const isMobile = isTouchDevice();
      mapStore.setState({ bounds, center, dragging: false });
      if (isMobile)
        mapStore.setState({
          nearbyLocationCenter: {
            ...center,
            name: null,
            type: "manual-update",
          },
        });
    },
    moveend: () => {
      // console.log("mapEvents moveend");
      const center = mapEvents.getCenter();
      const isMobile = isTouchDevice();
      mapStore.setState({
        bounds: mapEvents.getBounds(),
        center,
        hasMovedMap: true,
      });
      if (isMobile)
        mapStore.setState({
          nearbyLocationCenter: {
            ...center,
            name: null,
            type: "manual-update",
          },
        });
    },
    // zoomlevelschange fires when the map first loads
    zoomlevelschange: () => {
      // console.log("mapEvents zoomlevelschange");
      const center = mapEvents.getCenter();
      const bounds = mapEvents.getBounds();
      const isMobile = isTouchDevice();
      mapStore.setState({ zoom: mapEvents.getZoom(), bounds, center });
      if (isMobile)
        mapStore.setState({
          nearbyLocationCenter: {
            ...center,
            name: null,
            type: "manual-update",
          },
        });
    },
    // zoom: () => {
    //   console.log("mapEvents zoom");
    //   useAppStore.setState()
    //   useAppStore.setState((s) => {
    //     s.map.zoom = mapEvents.getZoom();
    //     // s.map.bounds = mapEvents.getBounds();
    //     // s.map.center = mapEvents.getCenter();
    //     return cloneDeep(s);
    //   });
    // },
    zoomstart: () => {
      console.log("mapEvents zoomstart");
    },
    // Need this for zoom events
    zoomend: () => {
      console.log("mapEvents zoomend");
      mapStore.setState({
        zoom: mapEvents.getZoom(),
      });
    },
    //Remnants of troubleshooting zoom issue on change station
    // baselayerchange: () => console.log("baselayerchange"),
    // overlayadd: () => console.log("overlayadd"),
    // overlayremove: () => console.log("overlayremove"),
    // layeradd: () => console.log("layeradd"),
    // layerremove: () => console.log("layerremove"),
    // unload: () => console.log("unload"),
    // viewreset: () => console.log("viewreset"),
    // movestart: () => console.log("movestart"),
    // zoom: () => console.log("zoom"),
    // move: () => console.log("move"),
    // autopanstart: () => console.log("autopanstart"),
    // // dragstart: () => console.log("dragstart"),
    // drag: () => console.log("drag"),
    // add: () => console.log("add"),
    // remove: () => console.log("remove"),
    // loading: () => console.log("loading"),
    // error: () => console.log("error"),
    // update: () => console.log("update"),
    // down: () => console.log("down"),
    // predrag: () => console.log("predrag"),
    // resize: () => console.log("resize"),
    // popupopen: () => console.log("popupopen"),
    // popupclose: () => console.log("popupclose"),
    // tooltipopen: () => console.log("tooltipopen"),
    // tooltipclose: () => console.log("tooltipclose"),
    // locationerror: () => console.log("locationerror"),
    // locationfound: () => console.log("locationfound"),
    // load: () => console.log("load"),
    // // click: () => console.log('click'),
    // dblclick: () => console.log("dblclick"),
    // mousedown: () => console.log("mousedown"),
    // mouseup: () => console.log("mouseup"),
    // mouseover: () => console.log("mouseover"),
    // mouseout: () => console.log("mouseout"),
    // mousemove: () => console.log("mousemove"),
    // contextmenu: () => console.log("contextmenu"),
    // preclick: () => console.log("preclick"),
    // keypress: () => console.log("keypress"),
    // keydown: () => console.log("keydown"),
    // keyup: () => console.log("keyup"),
    // zoomanim: () => console.log("zoomanim"),
    // tileunload: () => console.log("tileunload"),
    // tileloadstart: () => console.log("tileloadstart"),
    // tileload: () => console.log("tileload"),
    // tileabort: () => console.log("tileabort"),
    // tileerror: () => console.log("tileerror"),
  });
  return null;
};
