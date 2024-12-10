import { SIDEBAR_WIDTH } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

export const DesktopSidebarContainer = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        `absolute bottom-0 left-0 top-0 hidden flex-col items-stretch bg-background pt-4 lg:flex`,
      )}
      style={{ width: SIDEBAR_WIDTH }}
    >
      {props.children}
    </div>
  );
};
