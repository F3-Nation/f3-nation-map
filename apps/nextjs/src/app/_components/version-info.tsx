import type { HTMLAttributes } from "react";

import { cn } from "@f3/ui";

import { env } from "~/env";
import packageJson from "../../../package.json";

export const VersionInfo = (props: HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  const channel = env.NEXT_PUBLIC_CHANNEL;
  const commitHashString = env.NEXT_PUBLIC_GIT_COMMIT_HASH
    ? ` (${env.NEXT_PUBLIC_GIT_COMMIT_HASH})`
    : "";
  return (
    <div {...rest} className={cn("text-gray-300", className)}>
      version {packageJson.version} - {channel}
      {commitHashString}
    </div>
  );
};
