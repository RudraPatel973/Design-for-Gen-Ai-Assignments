-- Run once in your Supabase project's SQL Editor.
-- Only these public greetings can be read without signing in; visitors cannot write.
begin;

create table public.greetings (
  id bigint generated always as identity primary key,
  phrase text not null check (char_length(phrase) between 1 and 100),
  language text not null unique check (char_length(language) between 1 and 100),
  description text not null check (char_length(description) between 1 and 500)
);

alter table public.greetings enable row level security;
revoke all on table public.greetings from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.greetings to anon, authenticated;

create policy "Anyone can read greetings"
  on public.greetings for select
  to anon, authenticated
  using (true);

insert into public.greetings (phrase, language, description) values
  ('Hello!', 'English', 'A familiar little word that can start something wonderful.'),
  ('¡Hola!', 'Spanish', 'A bright, friendly hello. Bring a smile along with it.'),
  ('Bonjour!', 'French', 'A good day begins with a warm greeting.'),
  ('નમસ્તે!', 'Gujarati', 'A respectful greeting, shared with warmth.'),
  ('こんにちは!', 'Japanese', 'A friendly daytime greeting to make someone feel welcome.'),
  ('Ciao!', 'Italian', 'An easygoing hello for friends, old and new.'),
  ('Olá!', 'Portuguese', 'Just a few letters, and a whole lot of welcome.'),
  ('안녕하세요!', 'Korean', 'A polite way to greet someone and start a conversation.'),
  ('Jambo!', 'Swahili', 'A cheerful hello to start a new connection.');

commit;
