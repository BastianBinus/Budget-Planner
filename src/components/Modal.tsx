import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Accessible modal. On mobile it slides up as a bottom sheet; on desktop it is
 * a centered card. Closes on backdrop click and on Escape.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl border border-border bg-card shadow-lg sm:rounded-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1.5 text-muted transition-colors hover:text-text"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">{children}</div>
      </div>
    </div>
  );
}
