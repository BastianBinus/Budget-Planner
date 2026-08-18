import { Outlet } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <span className="text-lg font-extrabold tracking-tight">BudgetPlanner</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
            className="rounded-full p-2 text-muted transition-colors hover:text-accent"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Abmelden"
            className="rounded-full p-2 text-muted transition-colors hover:text-accent"
          >
            <LogOut size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
