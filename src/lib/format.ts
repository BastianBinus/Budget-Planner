const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Formats a number as German euro currency, e.g. `1.234,56 €`. */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Formats an ISO date string as German short date, e.g. `18. Aug 2026`. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
