-- Run once in the existing Supabase SQL Editor, after the profiles migration.
begin;
create table public.caption_generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index generation_user_date on public.caption_generation_requests (user_id, created_at);
create table public.captions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null unique references public.caption_generation_requests(id),
  category text not null check (category in ('Campus','Subway','Food','Weekend')),
  topic text not null check (char_length(trim(topic)) between 10 and 400),
  caption text not null check (char_length(trim(caption)) between 1 and 280),
  prompt text not null check (char_length(prompt) between 1 and 4000),
  model text not null check (char_length(model) between 1 and 100),
  created_at timestamptz not null default now()
);
create index captions_created_at on public.captions (created_at desc);
create table public.caption_votes (
  id uuid primary key default gen_random_uuid(),
  caption_id uuid not null references public.captions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  created_at timestamptz not null default now(),
  unique (caption_id, user_id)
);
-- Enables RLS on every existing public table, including greetings and profiles.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
revoke all on public.caption_generation_requests, public.captions, public.caption_votes from anon, authenticated;
grant select on public.caption_generation_requests to authenticated;
grant select on public.captions to anon, authenticated;
grant insert (creator_id, request_id, category, topic, caption, prompt, model) on public.captions to authenticated;
grant select on public.caption_votes to authenticated;
grant insert (caption_id, user_id, value) on public.caption_votes to authenticated;
create policy "Read your own generation requests" on public.caption_generation_requests for select to authenticated using (user_id = (select auth.uid()));
create policy "Public captions are readable" on public.captions for select to anon, authenticated using (true);
create policy "Publish your own generation" on public.captions for insert to authenticated
with check (creator_id = (select auth.uid()) and exists (select 1 from public.caption_generation_requests r where r.id = request_id and r.user_id = (select auth.uid())));
create policy "Read your own votes" on public.caption_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "Insert your own vote" on public.caption_votes for insert to authenticated
with check (user_id = (select auth.uid()));
-- No update/delete grants or policies: votes are immutable and each request publishes once.
create function public.reserve_caption_generation() returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); rid uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if (select count(*) from public.caption_generation_requests where user_id = uid and created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC') >= 10 then
    raise exception 'daily limit reached';
  end if;
  insert into public.caption_generation_requests (user_id) values (uid) returning id into rid;
  return rid;
end;
$$;
revoke all on function public.reserve_caption_generation() from public, anon;
grant execute on function public.reserve_caption_generation() to authenticated;
-- Only aggregate counts are exposed. Individual voter identities stay private.
create function public.caption_feed(chosen_category text default null, chosen_sort text default 'new')
returns table (id uuid, topic text, category text, caption text, prompt text, model text, created_at timestamptz, upvotes bigint, downvotes bigint)
language sql stable security definer set search_path = '' as $$
  select c.id, c.topic, c.category, c.caption, c.prompt, c.model, c.created_at,
    count(v.id) filter (where v.value = 1), count(v.id) filter (where v.value = -1)
  from public.captions c left join public.caption_votes v on v.caption_id = c.id
  where chosen_category is null or c.category = chosen_category
  group by c.id
  order by case when chosen_sort = 'top' then coalesce(sum(v.value),0) else 0 end desc, c.created_at desc, c.id
  limit 60;
$$;
revoke all on function public.caption_feed(text,text) from public;
grant execute on function public.caption_feed(text,text) to anon, authenticated;
commit;
