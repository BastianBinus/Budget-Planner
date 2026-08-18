-- Profiles hold a unique display name (username) so users can sign in with
-- either their display name or their email.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness for display names.
create unique index profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Create the profile row from the display_name passed in signUp metadata.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'display_name', '') <> '' then
    insert into public.profiles (id, username)
    values (new.id, new.raw_user_meta_data->>'display_name');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Pre-auth helpers (callable by anon): resolve a display name to its email,
-- and check whether a display name is still free.
create or replace function public.email_for_username(uname text)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(uname)
  limit 1;
$$;

create or replace function public.username_available(uname text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(uname)
  );
$$;

revoke execute on function public.email_for_username(text) from public;
revoke execute on function public.username_available(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
