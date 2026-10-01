export function validateNames(first: unknown, last: unknown) {
  if (typeof first !== "string" || typeof last !== "string") return null;
  const firstName = first.trim();
  const lastName = last.trim();
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) return null;
  return { first_name: firstName, last_name: lastName };
}

export function imageExtension(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (type === "image/png" && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return "png";
  if (type === "image/webp" && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}
