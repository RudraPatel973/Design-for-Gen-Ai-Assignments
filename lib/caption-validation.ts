export const tones = ["Dry wit", "Wholesome", "Chaotic"] as const;
export function captionTone(value: unknown) { return tones.includes(value as typeof tones[number]) ? value as typeof tones[number] : null; }
export const categories = ["Campus", "Subway", "Food", "Weekend"] as const;
export type Category = typeof categories[number];
export function validateGeneration(topic: unknown, category: unknown) {
  if (typeof topic !== "string" || typeof category !== "string") return null;
  const trimmed = topic.trim();
  if (trimmed.length < 10 || trimmed.length > 400 || !categories.includes(category as Category)) return null;
  return { topic: trimmed, category: category as Category };
}
export function validateVote(id: unknown, value: unknown) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) && (value === "1" || value === "-1");
}
export function parseCaption(text: string) {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || !("caption" in value) || typeof value.caption !== "string") throw new Error("Invalid AI response");
  const caption = value.caption.trim();
  if (!caption || caption.length > 280) throw new Error("Invalid AI response");
  return caption;
}
