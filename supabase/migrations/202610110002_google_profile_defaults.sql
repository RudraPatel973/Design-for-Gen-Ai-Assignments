-- Run once AFTER the profiles migration. Names remain editable and nullable.
begin;
create function public.google_profile_names(metadata jsonb)
returns table(first_name text, last_name text)
language sql immutable set search_path = '' as $$
  with names as (
    select coalesce(nullif(btrim(metadata->>'full_name'),''), nullif(btrim(metadata->>'name'),''), '') as full_name
  ), fields as (
    select coalesce(nullif(btrim(metadata->>'given_name'),''), nullif(btrim(metadata->>'first_name'),''), nullif(split_part(regexp_replace(full_name, '\s+', ' ', 'g'), ' ', 1),'')) as first_name,
      coalesce(nullif(btrim(metadata->>'family_name'),''), nullif(btrim(metadata->>'last_name'),''), nullif(regexp_replace(full_name, '^\S+\s*', ''),'')) as last_name
    from names
  )
  select case when char_length(first_name) <= 80 then first_name end,
    case when char_length(last_name) <= 80 then last_name end from fields;
$$;
revoke all on function public.google_profile_names(jsonb) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare imported record;
begin
  select * into imported from public.google_profile_names(
    case when new.raw_app_meta_data->>'provider' = 'google' then new.raw_user_meta_data else '{}'::jsonb end
  );
  insert into public.profiles (id, first_name, last_name)
  values (new.id, imported.first_name, imported.last_name)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Fill missing names for existing Google users. Preserve names already edited.
update public.profiles p
set first_name = coalesce(p.first_name, n.first_name),
    last_name = coalesce(p.last_name, n.last_name)
from auth.users u
cross join lateral public.google_profile_names(u.raw_user_meta_data) n
where p.id = u.id and (u.raw_app_meta_data->>'provider' = 'google' or exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'google'
));
commit;
-- Google pictures are read from the Google identity's HTTPS URL at render time.
-- An uploaded private Storage photo always takes precedence; no image bytes in SQL.
