import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

import type { UserRole } from "@f3/shared/app/enums";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 * Need separate declaration in @f3/nextjs and @f3/auth
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    email: string | undefined;
    role: UserRole | undefined;
  }

  interface JWT extends DefaultJWT {
    id?: string | number;
    email: string | undefined;
    role: UserRole | undefined;
    signinunixsecondsepoch: number;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module "@tanstack/table-core" {
  interface ColumnMeta {
    // Used in the Header component and in csv
    name?: string;
    excludeFromCsv?: boolean;
  }
}

// https://stackoverflow.com/questions/71099924/cannot-find-module-file-name-png-or-its-corresponding-type-declarations-type
declare global {
  declare module "*.png" {
    const content: string;
    export default content;
  }
  declare module "*.svg" {
    const content: string;
    export default content;
  }
  declare module "*.jpeg" {
    const content: string;
    export default content;
  }
  declare module "*.jpg" {
    const content: string;
    export default content;
  }
  declare module "*.webp" {
    const content: string;
    export default content;
  }
}

declare module "leaflet" {
  // must import leaflet-canvas-markers.js before using this type
  type CanvasIconLayer = {
    addTo: (map: Map) => CanvasIconLayer;
    addOnClickListener: (callback: (e: any, data: any) => void) => void;
    addOnHoverListener: (callback: (e: any, data: any) => void) => void;
    addLayers: (layers: L.Marker<any>[]) => void;
    addMarkers: (markers: L.Marker<any>[]) => void;
    removeMarker: (marker: L.Marker<any>, redraw?: boolean) => void;
    clearLayers: () => void;
    redraw: (clear?: boolean) => void;
    remove: () => void;
  };

  interface MarkerOptions extends L.MarkerOptions {
    data?: unknown;
  }

  // Must import smooth-zoom-wheel.js before using these options
  interface MapOptions extends L.MapOptions {
    smoothWheelZoom?: boolean;
    smoothSensitivity?: number;
  }

  // must import leaflet-canvas-markers.js before using this function
  export function canvasIconLayer(options: {}): CanvasIconLayer;
}
