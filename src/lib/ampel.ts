/** Traffic-light bar colour for a spent/limit ratio (null = no limit set). */
export function ampelBarClass(ratio: number | null): string {
  if (ratio === null) return 'bg-border';
  if (ratio < 0.8) return 'bg-ok';
  if (ratio < 1) return 'bg-warn';
  return 'bg-over';
}
