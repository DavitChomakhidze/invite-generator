import type { Audience } from "@/lib/themes";

// Shown until a real photo is added; "for him" designs use the boy illustration.
export const DEMO_PORTRAITS: Record<Audience, string> = {
  her: "/images/demo-portrait.svg",
  him: "/images/demo-portrait-boy.svg",
};

export function isPortraitUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      ["images.unsplash.com", "res.cloudinary.com"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}
