import { z } from "zod";

export enum SnapPoint {
  "pt-0.95" = 0.95,
  // "pt-0.5" = 0.5,
  "pt-150px" = "150px",
}

export const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const SHORT_DAY_ORDER = ["Su", "M", "Tu", "W", "Th", "F", "Sa"] as const;

export const DEFAULT_ZOOM = 2.9;
export const BOONE_CENTER = [36.2, -81.66] as [number, number];
export const DEFAULT_CENTER = BOONE_CENTER;

export const CLOSE_ZOOM = 13;
export const FAR_ZOOM = 3;
export const COUNTRY_ZOOM = 5; // below 5 it is red

export enum BreakPoints {
  LG = 1024,
}

export const HEADER_HEIGHT = 96;
export const SIDEBAR_WIDTH = 360;
export const MAX_DESKTOP_WORKOUT_PANEL_WIDTH = 448; // must match to MD

export const MAX_PLACES_AUTOCOMPLETE_RADIUS = 50000;

export const SELECTED_ITEM_DEBOUNCE_TIME_MS = 100;

export const Z_INDEX = {
  NAVIGATION_MENU: 1,

  NAVIGATION_MENU_ROOT: 10,

  CALENDAR_CELL: 20,

  SELECT_CONTENT: 50,
  SHEET_OVERLAY: 50,
  SHEET_VARIANTS: 50,
  HOVER_CARD_CONTENT: 50,
  DRAWER_OVERLAY: 50,
  DRAWER_CONTENT: 50,
  DIALOG_CONTENT_CONTAINER: 50,
  ALERT_DIALOG_OVERLAY: 50,
  CONTEXT_MENU_CONTENT: 50,
  CONTEXT_MENU_SUBCONTENT: 50,
  ALERT_DIALOG: 50,
  POPOVER_CONTENT: 50,

  DIALOG_CONTENT: 51,

  MAP_SEARCHBOX_POPOVER_CONTENT_DESKTOP: 1000,
  MOBILE_FILTER_BUTTONS: 1000,
  PLACE_RESULTS_ICON_PANE: 1000,
  MOBILE_NEARBY_LOCATIONS: 1000,
  DEBUG_INFO: 1000,
  CENTER_POINT_MARKER_PANE: 1000,
  NON_HOVERED_MAP_MARKER: 1000,
  ZOOM_AND_TILE_BUTTONS: 1000,
  OVERLAY_BUTTONS: 1001,

  ZOOMED_MARKER_PANE: 1001,
  F3_LOGO: 1001,

  SELECTED_ICON_MARKER_PANE: 1102,
  PANEL_ITEM_MARKER_PANE: 1103,
  LOCATION_PANEL: 1104,
  SELECTED_ITEM_CONTAINER_DESKTOP: 1105,
  MOBILE_SEARCH_RESULTS: 1106,

  MAP_SEARCHBOX_MOBILE: 1107,

  DIALOG_OVERLAY: 1201,
  USER_LOCATION_ICON: 1201,
  USER_LOCATION_INFO_MODAL: 1201,
  WORKOUT_DETAILS_MODAL: 1201,
  HOW_TO_JOIN_MODAL: 1201,

  MOBILE_ALL_FILTERS_CONTAINER: 2001,

  DROPDOWN_MENU_SUBCONTENT: 2002,
  DROPDOWN_MENU_CONTENT: 2002,

  TOOLTIP_CONTENT: 9000,

  // Default station button
  HOVER_CARD: 9000,
} as const;

export const MOBILE_SEARCH_RESULT_ITEM_HEIGHT = 128;

export const MIN_TEXT_LENGTH_FOR_SEARCH_RESULTS = 2;

export const feedbackSchema = z.object({
  type: z.string(),
  subject: z.string(),
  email: z.string(),
  description: z.string(),
});

export type FeedbackSchema = z.infer<typeof feedbackSchema>;

export const filterButtonClassName =
  "text-sm w-full whitespace-nowrap font-semibold pointer-events-auto flex items-center justify-center gap-2 rounded-md bg-background px-2 py-1 shadow text-foreground";
