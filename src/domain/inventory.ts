export type Layout = (string | null)[];
export function reconcileLayout(value: unknown, ids: readonly string[]): Layout {
 const capacity = Math.max(27, Math.ceil(ids.length / 9) * 9);
 const known = new Set(ids), seen = new Set<string>();
 const result: Layout = Array.from({ length: capacity }, (_, index) => {
  const id = Array.isArray(value) ? value[index] : null;
  if (typeof id !== 'string' || !known.has(id) || seen.has(id)) return null;
  seen.add(id); return id;
 });
 for (const id of ids) if (!seen.has(id)) { result[result.indexOf(null)] = id; seen.add(id); }
 return result;
}
export function moveSlot(layout: Layout, from: number, to: number): Layout {
 const result = [...layout];
 if (![from, to].every(i => Number.isInteger(i) && i >= 0 && i < result.length)) return result;
 [result[from], result[to]] = [result[to], result[from]]; return result;
}
