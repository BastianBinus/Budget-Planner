interface PagePlaceholderProps {
  title: string;
  hint: string;
}

/** Temporary Phase 0 placeholder shown until each feature page is built. */
export function PagePlaceholder({ title, hint }: PagePlaceholderProps) {
  return (
    <section className="pt-2">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="rounded-card border border-border bg-card p-5 text-sm text-muted shadow-sm">
        {hint}
      </div>
    </section>
  );
}
