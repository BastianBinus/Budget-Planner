import { NavLink } from 'react-router-dom';
import { LayoutGrid, ListOrdered, PieChart, Target } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/transactions', label: 'Transakt.', icon: ListOrdered, end: false },
  { to: '/budget', label: 'Budget', icon: PieChart, end: false },
  { to: '/goals', label: 'Ziele', icon: Target, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card">
      <div className="mx-auto flex max-w-md justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
