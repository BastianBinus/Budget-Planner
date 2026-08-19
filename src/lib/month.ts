// Helpers for working with calendar months, stored as an ISO date on the first
// of the month, e.g. "2026-08-01". Shared by the budget and dashboard views.

/** Returns the first day of the current month as `YYYY-MM-01`. */
export function currentMonthStart(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/** Shifts a month string by `delta` months (can be negative). */
export function addMonths(monthIso: string, delta: number): string {
  const [year, month] = monthIso.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}-01`;
}

/** The half-open date range [start, end) covering the given month. */
export function monthRange(monthIso: string): { start: string; end: string } {
  return { start: monthIso, end: addMonths(monthIso, 1) };
}

const monthFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

/** Formats a month string as German long month + year, e.g. `August 2026`. */
export function formatMonth(monthIso: string): string {
  const [year, month] = monthIso.split('-').map(Number);
  return monthFormatter.format(new Date(year, month - 1, 1));
}
