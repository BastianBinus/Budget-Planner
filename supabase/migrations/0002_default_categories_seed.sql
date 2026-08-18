-- Seed a sensible set of default categories for every new user, and backfill
-- any user that already exists.

create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (user_id, name, kind, color, sort_order) values
    (new.id, 'Gehalt', 'income', '#14b8a6', 0),
    (new.id, 'Sonstiges Einkommen', 'income', '#22c55e', 1),
    (new.id, 'Lebensmittel', 'expense', '#14b8a6', 0),
    (new.id, 'Miete & Fixkosten', 'expense', '#ef4444', 1),
    (new.id, 'Transport', 'expense', '#6366f1', 2),
    (new.id, 'Freizeit', 'expense', '#f59e0b', 3),
    (new.id, 'Sonstiges', 'expense', '#94a3b8', 4);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();

-- Backfill: give existing users the defaults if they have none yet.
insert into public.categories (user_id, name, kind, color, sort_order)
select u.id, d.name, d.kind, d.color, d.sort_order
from auth.users u
cross join (values
  ('Gehalt', 'income', '#14b8a6', 0),
  ('Sonstiges Einkommen', 'income', '#22c55e', 1),
  ('Lebensmittel', 'expense', '#14b8a6', 0),
  ('Miete & Fixkosten', 'expense', '#ef4444', 1),
  ('Transport', 'expense', '#6366f1', 2),
  ('Freizeit', 'expense', '#f59e0b', 3),
  ('Sonstiges', 'expense', '#94a3b8', 4)
) as d(name, kind, color, sort_order)
where not exists (select 1 from public.categories c where c.user_id = u.id);
