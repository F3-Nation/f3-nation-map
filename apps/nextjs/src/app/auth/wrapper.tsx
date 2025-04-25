import type { ReactNode } from "react";

import { cn } from "@acme/ui";

export const AuthWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-1 flex-col items-center bg-background p-8 pb-16 text-center",
        "xs:w-min xs:min-w-[400px] xs:shadow-md xs:rounded-xl xs:pb-8 xs:flex-grow-0 xs:h-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};
