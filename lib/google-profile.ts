export function googlePhotoUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    if (url.hostname !== "googleusercontent.com" && !url.hostname.endsWith(".googleusercontent.com")) return undefined;
    return url.toString();
  } catch { return undefined; }
}

export function googleProfile(metadata: Record<string, unknown>) {
  const name = (value: unknown) => typeof value === "string" && value.trim().length <= 80 ? value.trim() || null : null;
  const full = typeof metadata.full_name === "string" ? metadata.full_name.trim() : typeof metadata.name === "string" ? metadata.name.trim() : "";
  const [first, ...last] = full.split(/\s+/);
  return {
    first_name: name(metadata.given_name) ?? name(metadata.first_name) ?? name(first),
    last_name: name(metadata.family_name) ?? name(metadata.last_name) ?? name(last.join(" ")),
    photo: googlePhotoUrl(metadata.avatar_url) ?? googlePhotoUrl(metadata.picture),
  };
}
