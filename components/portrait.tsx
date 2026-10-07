"use client";
import Image from "next/image";
import { useState } from "react";
import type { ScrollSettings } from "@/lib/invitation-model";
import { DEMO_PORTRAIT, isPortraitUrl } from "@/lib/portrait";

export function Portrait({
  portrait,
  name,
  className,
}: {
  portrait: ScrollSettings["portrait"];
  name: string;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const remote =
    portrait.kind === "remote" &&
    isPortraitUrl(portrait.url) &&
    portrait.url !== failedUrl;
  const src =
    remote && portrait.kind === "remote" ? portrait.url : DEMO_PORTRAIT;
  return (
    <Image
      src={src}
      width={600}
      height={800}
      className={className}
      alt={
        remote
          ? `Portrait of ${name || "the birthday person"}`
          : "Illustrated demo portrait"
      }
      unoptimized={remote}
      loading="eager"
      referrerPolicy="no-referrer"
      onError={() => {
        if (portrait.kind === "remote") setFailedUrl(portrait.url);
      }}
    />
  );
}
