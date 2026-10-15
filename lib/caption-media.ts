export const maxCaptionMediaBytes = 3 * 1024 * 1024;
export const captionMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export function captionMediaExtension(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (type === "image/png" && [137,80,78,71,13,10,26,10].every((value,index) => bytes[index] === value)) return "png";
  if (type === "image/webp" && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "webp";
  if (type === "image/gif" && ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0,6)))) return "gif";
  return null;
}
export function validMediaPath(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(value);
}
