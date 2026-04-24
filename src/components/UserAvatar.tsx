"use client";

import { useId } from "react";

import { AvatarArt } from "@/components/avatar-faces";
import { parseLablogAvatarId } from "@/lib/avatar-ids";
import { cn } from "@/lib/utils";

export function UserAvatar({
  avatarId,
  size = 32,
  className,
  title,
}: {
  avatarId: number;
  size?: number;
  className?: string;
  /** Optional tooltip / a11y name */
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const id = parseLablogAvatarId(avatarId);
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted align-middle",
        className
      )}
      style={{ width: size, height: size }}
    >
      <AvatarArt id={id} uniquePrefix={`ua-${uid}`} pixelSize={size} className="pointer-events-none" />
    </span>
  );
}
