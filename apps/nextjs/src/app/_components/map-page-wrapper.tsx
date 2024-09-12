import Image from "next/image";
import Link from "next/link";

import {
  BreakPoints,
  HEADER_HEIGHT,
  SIDEBAR_WIDTH,
} from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { Responsive } from "~/utils/responsive";
import { MapSearchBox } from "./map/map-searchbox-desktop";
import { Sidebar } from "./sidebar/sidebar";
import { SidebarContainer } from "./sidebar/sidebar-container";

const HeaderContainer = (props: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        `absolute left-0 right-0 top-0`,
        `flex items-center justify-center`,
        `border-b-2 border-ring bg-background px-2`,
      )}
      style={{ height: HEADER_HEIGHT }}
    >
      {props.children}
    </div>
  );
};

const Header = () => {
  return (
    <>
      <Link
        href="https://f3nation.com/"
        target="_blank"
        className="absolute left-4"
      >
        <Image src="/f3_logo.png" alt="F3 Logo" width={64} height={64} />
      </Link>
      <div className="relative w-2/5">
        <MapSearchBox hideLogo className="" />
        <p className="mt-1 w-full text-center text-xs">
          Search F3’s network of 4,368 free, peer-led workouts
        </p>
      </div>
    </>
  );
};

export const MapPageWrapper = (props: { children: React.ReactNode }) => {
  RERENDER_LOGS && console.log("HeaderAndSidebar rerender");
  return (
    <>
      <Responsive minWidth={BreakPoints.LG}>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <HeaderContainer>
          <Header />
        </HeaderContainer>
        <div style={{ paddingLeft: SIDEBAR_WIDTH, paddingTop: HEADER_HEIGHT }}>
          {props.children}
        </div>
      </Responsive>
      <Responsive maxWidth={BreakPoints.LG}>{props.children}</Responsive>
    </>
  );
};
