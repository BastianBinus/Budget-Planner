import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <span className="text-lg font-extrabold tracking-tight">BudgetPlanner</span>
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
          className="rounded-full p-2 text-muted transition-colors hover:text-accent"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 px-4 pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
