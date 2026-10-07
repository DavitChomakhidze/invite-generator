export const DEMO_PORTRAIT = "/images/demo-portrait.svg";

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
