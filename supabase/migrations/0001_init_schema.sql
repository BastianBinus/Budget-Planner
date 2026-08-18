-- BudgetPlanner core schema. Every table is scoped to the owning user via
-- user_id (defaults to auth.uid()) and protected by RLS.

-- 1. categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  color text not null default '#14b8a6',
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null default current_date,
  category_id uuid references public.categories(id) on delete set null,
  kind text not null check (kind in ('income', 'expense')),
  note text,
  created_at timestamptz not null default now()
);
create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_category_idx on public.transactions (category_id);

-- 3. budgets (monthly limit per category)
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null,
  limit_amount numeric(12, 2) not null check (limit_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

-- 4. savings_goals
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now()
);

-- 5. savings_contributions
create table public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index savings_contributions_goal_idx on public.savings_contributions (goal_id);

-- 6. recurring_rules (fixed costs / recurring income)
create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  kind text not null check (kind in ('income', 'expense')),
  day_of_month integer not null check (day_of_month between 1 and 31),
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Row Level Security: each user sees and writes only their own rows.
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.recurring_rules enable row level security;

create policy "own rows" on public.categories
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.transactions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.budgets
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.savings_goals
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.savings_contributions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.recurring_rules
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
