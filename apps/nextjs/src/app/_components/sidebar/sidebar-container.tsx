import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

export const SidebarContainer = (props: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        `absolute bottom-0 left-0 flex flex-col items-stretch bg-background`,
      )}
      style={{ width: SIDEBAR_WIDTH, top: HEADER_HEIGHT }}
    >
      {props.children}
    </div>
  );
};
