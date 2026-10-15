-- Add optional uploaded images/GIFs without changing old caption feeds.
begin;
alter table public.captions add column media_path text null
  check (media_path is null or starts_with(media_path, creator_id::text || '/'));
grant insert (media_path) on public.captions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('caption-media', 'caption-media', true, 3145728, array['image/jpeg','image/png','image/webp','image/gif']);
create policy "Upload your own caption media" on storage.objects for insert to authenticated
with check (bucket_id = 'caption-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Read your own caption media objects" on storage.objects for select to authenticated
using (bucket_id = 'caption-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Cleanup failed publications only. A published caption's file remains available.
create policy "Remove unpublished caption media" on storage.objects for delete to authenticated
using (bucket_id = 'caption-media' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not exists (select 1 from public.captions c where c.media_path = name));

create function public.caption_media_feed(chosen_category text default null, chosen_sort text default 'new')
returns table (id uuid, topic text, category text, caption text, prompt text, model text, created_at timestamptz, upvotes bigint, downvotes bigint, media_path text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.topic, c.category, c.caption, c.prompt, c.model, c.created_at,
    count(v.id) filter (where v.value = 1), count(v.id) filter (where v.value = -1), c.media_path
  from public.captions c left join public.caption_votes v on v.caption_id = c.id
  where chosen_category is null or c.category = chosen_category
  group by c.id
  order by case when chosen_sort = 'top' then coalesce(sum(v.value),0) else 0 end desc, c.created_at desc, c.id
  limit 60;
$$;
revoke all on function public.caption_media_feed(text,text) from public;
grant execute on function public.caption_media_feed(text,text) to anon, authenticated;
commit;
