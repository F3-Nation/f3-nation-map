"use client";

import { useMapEvents } from "react-leaflet";

import { SnapPoint } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { drawerStore } from "~/utils/store/drawer";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";

/**
 * Hack to listen to map zoom and update the ui based on the zoom level
 * Specifically for the label simulation
 */
export const MapListener = () => {
  RERENDER_LOGS && console.log("MapListener rerender");

  const mapEvents = useMapEvents({
    click: () => {
      console.log("mapEvents click");
      selectedItemStore.setState({ locationId: null, eventId: null });
      drawerStore.setState((s) =>
        s.snap === SnapPoint["pt-150px"] ? s : { snap: SnapPoint["pt-150px"] },
      );
      // Special fn to prevent filtersState from being changed
      filterStore.setState((s) =>
        s.allFilters === true ? { allFilters: false } : s,
      );
    },
    dragend: () => {
      console.log("mapEvents dragend");
      mapStore.setState({
        bounds: mapEvents.getBounds(),
        center: mapEvents.getCenter(),
      });
    },
    moveend: () => {
      console.log("mapEvents moveend");
      mapStore.setState({
        bounds: mapEvents.getBounds(),
        center: mapEvents.getCenter(),
      });
    },
    // zoomlevelschange fires when the map first loads
    zoomlevelschange: () => {
      console.log("mapEvents zoomlevelschange");
      mapStore.setState({
        zoom: mapEvents.getZoom(),
        bounds: mapEvents.getBounds(),
        center: mapEvents.getCenter(),
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
      mapStore.setState({
        zoomAction: true,
      });
    },
    // Need this for zoom events
    zoomend: () => {
      console.log("mapEvents zoomend");
      mapStore.setState({
        zoom: mapEvents.getZoom(),
        zoomAction: false,
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
    // dragstart: () => console.log("dragstart"),
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
