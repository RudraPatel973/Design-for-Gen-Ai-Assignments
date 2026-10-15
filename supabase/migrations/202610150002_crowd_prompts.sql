-- Crowd-picked daily prompts, captions linked to a prompt day, and personal caption stats.
-- Run once in the Supabase SQL Editor, after 202610150001_caption_media.sql.
begin;
create table public.prompt_suggestions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  topic text not null check (char_length(trim(topic)) between 10 and 200),
  category text not null check (category in ('Campus','Subway','Food','Weekend')),
  created_at timestamptz not null default now()
);
create index prompt_suggestions_created_at on public.prompt_suggestions (created_at desc);
create table public.prompt_suggestion_votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.prompt_suggestions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  created_at timestamptz not null default now(),
  unique (suggestion_id, user_id)
);
alter table public.prompt_suggestions enable row level security;
alter table public.prompt_suggestion_votes enable row level security;
revoke all on public.prompt_suggestions, public.prompt_suggestion_votes from anon, authenticated;
grant insert (author_id, topic, category) on public.prompt_suggestions to authenticated;
grant select on public.prompt_suggestion_votes to authenticated;
grant insert (suggestion_id, user_id, value) on public.prompt_suggestion_votes to authenticated;

-- Start of the current UTC day, matching the daily prompt reset.
create function public.utc_day_start() returns timestamptz
language sql stable set search_path = '' as $$ select date_trunc('day', now() at time zone 'UTC') at time zone 'UTC' $$;

-- Up to 3 suggestions per user per UTC day. Counted by a definer function so authors never read others' rows.
create function public.suggestions_today_count() returns bigint
language sql stable security definer set search_path = '' as $$
  select count(*) from public.prompt_suggestions where author_id = (select auth.uid()) and created_at >= public.utc_day_start()
$$;
revoke all on function public.suggestions_today_count() from public, anon;
grant execute on function public.suggestions_today_count() to authenticated;
create policy "Suggest up to three prompts a day" on public.prompt_suggestions for insert to authenticated
with check (author_id = (select auth.uid()) and public.suggestions_today_count() < 3);

-- Voting closes at midnight UTC so a day's winner can't change afterward. No voting on your own suggestion.
create function public.suggestion_open_for_vote(sid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.prompt_suggestions s where s.id = sid
    and s.created_at >= public.utc_day_start() and s.author_id <> (select auth.uid()))
$$;
revoke all on function public.suggestion_open_for_vote(uuid) from public, anon;
grant execute on function public.suggestion_open_for_vote(uuid) to authenticated;
create policy "Read your own suggestion votes" on public.prompt_suggestion_votes for select to authenticated using (user_id = (select auth.uid()));
create policy "Vote on today's suggestions" on public.prompt_suggestion_votes for insert to authenticated
with check (user_id = (select auth.uid()) and public.suggestion_open_for_vote(suggestion_id));

-- Today's suggestions with aggregate scores. Author identities stay private.
create function public.todays_prompt_suggestions()
returns table (id uuid, topic text, category text, created_at timestamptz, upvotes bigint, downvotes bigint, mine boolean)
language sql stable security definer set search_path = '' as $$
  select s.id, s.topic, s.category, s.created_at,
    count(v.id) filter (where v.value = 1), count(v.id) filter (where v.value = -1),
    s.author_id = (select auth.uid())
  from public.prompt_suggestions s left join public.prompt_suggestion_votes v on v.suggestion_id = s.id
  where s.created_at >= public.utc_day_start()
  group by s.id
  order by coalesce(sum(v.value),0) desc, s.created_at, s.id
  limit 50;
$$;
revoke all on function public.todays_prompt_suggestions() from public;
grant execute on function public.todays_prompt_suggestions() to anon, authenticated;

-- The prompt for a day is the previous UTC day's top suggestion with a net score of at least +1.
-- Ties go to the earliest suggestion. No row means the app falls back to its starter prompts.
create function public.crowd_prompt_for(for_day date)
returns table (topic text, category text, score bigint)
language sql stable security definer set search_path = '' as $$
  select s.topic, s.category, coalesce(sum(v.value),0)
  from public.prompt_suggestions s left join public.prompt_suggestion_votes v on v.suggestion_id = s.id
  where s.created_at >= (for_day - 1)::timestamp at time zone 'UTC' and s.created_at < for_day::timestamp at time zone 'UTC'
  group by s.id
  having coalesce(sum(v.value),0) >= 1
  order by coalesce(sum(v.value),0) desc, s.created_at, s.id
  limit 1;
$$;
revoke all on function public.crowd_prompt_for(date) from public;
grant execute on function public.crowd_prompt_for(date) to anon, authenticated;

-- Captions written from the daily prompt record which day's prompt they answered.
alter table public.captions add column prompt_date date null;
grant insert (prompt_date) on public.captions to authenticated;
create index captions_prompt_date on public.captions (prompt_date) where prompt_date is not null;

create function public.caption_prompt_feed(chosen_category text default null, chosen_sort text default 'new', chosen_day date default null)
returns table (id uuid, topic text, category text, caption text, prompt text, model text, created_at timestamptz, upvotes bigint, downvotes bigint, media_path text, prompt_date date)
language sql stable security definer set search_path = '' as $$
  select c.id, c.topic, c.category, c.caption, c.prompt, c.model, c.created_at,
    count(v.id) filter (where v.value = 1), count(v.id) filter (where v.value = -1), c.media_path, c.prompt_date
  from public.captions c left join public.caption_votes v on v.caption_id = c.id
  where (chosen_category is null or c.category = chosen_category) and (chosen_day is null or c.prompt_date = chosen_day)
  group by c.id
  order by case when chosen_sort = 'top' then coalesce(sum(v.value),0) else 0 end desc, c.created_at desc, c.id
  limit 60;
$$;
revoke all on function public.caption_prompt_feed(text,text,date) from public;
grant execute on function public.caption_prompt_feed(text,text,date) to anon, authenticated;

-- The signed-in user's own captions with vote totals.
create function public.my_caption_stats()
returns table (id uuid, topic text, category text, caption text, created_at timestamptz, prompt_date date, media_path text, upvotes bigint, downvotes bigint)
language sql stable security definer set search_path = '' as $$
  select c.id, c.topic, c.category, c.caption, c.created_at, c.prompt_date, c.media_path,
    count(v.id) filter (where v.value = 1), count(v.id) filter (where v.value = -1)
  from public.captions c left join public.caption_votes v on v.caption_id = c.id
  where c.creator_id = (select auth.uid())
  group by c.id
  order by c.created_at desc
  limit 100;
$$;
revoke all on function public.my_caption_stats() from public, anon;
grant execute on function public.my_caption_stats() to authenticated;
commit;
