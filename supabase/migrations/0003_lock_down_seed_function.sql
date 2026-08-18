-- The seed function only needs to run as the auth.users insert trigger, never
-- as a client-callable RPC. Revoke execute from the API roles.
revoke execute on function public.seed_default_categories() from anon, authenticated, public;
