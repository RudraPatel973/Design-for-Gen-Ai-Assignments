export const templateVariables = ["moment", "category", "tone", "previous_output", "terms", "examples"] as const;
// Replaces {{name}} placeholders. Unknown placeholders are left as written so mistakes are visible in the logs.
export function fillTemplate(template: string, values: Partial<Record<typeof templateVariables[number], string>>) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, name: string) => {
    const value = values[name as typeof templateVariables[number]];
    return value === undefined ? match : value;
  });
}
// Weighted random choice; `roll` is in [0, 1). Returns null when no option has weight.
export function pickWeighted<T>(options: { value: T; weight: number }[], roll: number) {
  const usable = options.filter(o => o.weight > 0);
  const total = usable.reduce((sum, o) => sum + o.weight, 0);
  if (!total) return null;
  let point = roll * total;
  for (const option of usable) { point -= option.weight; if (point < 0) return option.value; }
  return usable[usable.length - 1].value;
}
