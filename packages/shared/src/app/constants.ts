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
export const DEFAULT_CENTER = [35, -80.955] as [number, number];

export const CLOSE_ZOOM = 13;
export const FAR_ZOOM = 3;

export enum BreakPoints {
  LG = 1024,
}

export const HEADER_HEIGHT = 96;
export const SIDEBAR_WIDTH = 360;

export const MAX_PLACES_AUTOCOMPLETE_RADIUS = 50000;

export const Z_INDEX = {
  // MOBILE_SIDEBAR: 2,
  // FEATURED_BLOG_POST: 20,
  NON_HOVERED_MAP_MARKER: 1000,
  // MAP_CONTAINER: 9000,

  // Mobile and desktop
  HEADER_CONTAINER: 7000,

  // For the admin page
  PUBLISHED_DIALOG_OVERLAY: 7500,

  MAP_HIDE_BUTTON: 8000,
  // PAYWALL_OVERLAY: 10000,
  // PAYWALL: 10001,

  // Favorites
  // Golfball o meter
  TOOLTIP: 9000,

  // Default station button
  HOVER_CARD: 9000,

  // MDCalendar and MDCombobox
  POPOVER: 9000,

  // None
  CONTEXT_MENU_SUBTRIGGER: 9001,
  CONTEXT_MENU_CONTENT: 9002,

  // Full screen photo
  DIALOG_OVERLAY: 9003,
  DIALOG: 9004,

  // Paywall
  ALERT_DIALOG_OVERLAY: 9010,
  ALERT_DIALOG: 9011,

  HOVERED_MAP_MARKER: 10000,
};

export const MOBILE_SEARCH_RESULT_ITEM_HEIGHT = 128;
