-- Run once in the SAME Supabase project's SQL Editor.
-- Photos are objects in private Storage; only their path is saved in profiles.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text null check (first_name is null or char_length(trim(first_name)) between 1 and 80),
  last_name text null check (last_name is null or char_length(trim(last_name)) between 1 and 80),
  avatar_path text null check (avatar_path is null or starts_with(avatar_path, id::text || '/'))
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, last_name, avatar_path) on public.profiles to authenticated;
create policy "Read your own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Edit your own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
-- Include users who signed up before this migration was run.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp']);
create policy "Read your own avatar" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload your own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete your own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;
