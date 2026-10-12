# Week 4 — Only in NYC

## Product decisions

Sam is new to NYC, chronically online, and living on campus. The feed turns relatable campus/subway/food/weekend moments into short, shareable captions. A rotating daily prompt reduces the effort of creating and gives users a reason to return. “Most postable” surfaces community favorites. Copyable captions make content easy to share. Showing the original moment and full prompt makes AI output easier to judge; category filters help users find relevant content instead of voting on an undifferentiated stream.

These are product hypotheses, not measured user outcomes. PM feedback has not been supplied yet; it must be collected and implemented before claiming the feedback portion of the rubric is complete.

## Required setup

1. Use the same Supabase project. Ensure the Assignment 3 profiles migration has run.
2. Run `supabase/migrations/202610110001_create_caption_ratings.sql` once in the SQL Editor.
3. Get a Gemini API key from Google AI Studio. Add `GEMINI_API_KEY` to `.env.local` and the existing Vercel project's Production/Preview environment variables. Keep it server-only. `GEMINI_MODEL` defaults to `gemini-2.5-flash` and can be changed to an available compatible model.
4. If the Supabase URL no longer resolves, open the Supabase dashboard and verify the original project is active and its URL matches `SUPABASE_URL`. Restore a paused project if needed; update local/Vercel configuration if the project URL has changed.
5. Push the commit and redeploy the same Vercel project. Add the deployment-specific `/auth/callback` URL to Supabase's redirect allowlist. Keep deployment protection off.

## Behavior

- `/captions`: public feed with category filters, newest/top sorting, aggregate votes, copy caption, and prompt transparency. Signed-out visitors get a sign-in link instead of vote controls.
- `/create`: gated caption studio. The Server Action independently verifies the user and makes a server-side Gemini request.
- Voting independently verifies authentication and inserts a new row into `caption_votes` with the caption ID and current user's ID.
- One immutable vote per user/caption; repeated submissions cannot inflate scores. Captions and votes cannot be edited/deleted through public APIs.
- A database function reserves each generation attempt atomically. Ten attempts per user per UTC day; failed AI attempts count toward the limit to prevent request abuse.
- Only successfully generated captions are saved and published. No sample cards are presented as real AI output.
- Topics/prompts/captions are public. The form makes this clear before publication.

## RLS

All public tables have RLS enabled by the migration. Existing greetings and profile policies remain in place. New policies permit public caption reads, authenticated users publishing with their own generation reservation, and users inserting/reading only their own votes. No anonymous writes, cross-user ownership, or vote updates/deletes. Requests are visible only to their owner and reserved via an authenticated RPC. Aggregate feed RPC returns no voter identities. No service-role key is used by the application.

Review any unrelated tables/policies added outside this repository: enabling RLS does not automatically tighten an independently created permissive policy.

Audit in Supabase SQL Editor:

```sql
select schemaname, tablename, rowsecurity
from pg_tables where schemaname = 'public';
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public';
```

## Verification before submission

1. Run `npm run lint`, `npm test`, and `npm run build`.
2. In Incognito, `/captions` loads publicly and `/create` redirects to login. No voting controls appear until login.
3. Log in and generate a caption. Confirm a new `captions` row holds the topic, prompt, model, creator ID, and AI result.
4. Vote “Post it” or “Skip it”. Confirm a new `caption_votes` row has the correct user ID/caption ID/value. Refresh and verify count plus personal vote persist.
5. Repeat the vote: the unique constraint prevents a second row. Use another account to verify independent votes and inaccessible personal vote records.
6. Confirm your two accounts cannot publish with each other's generation reservations or submit votes attributed to each other via the Data API.
7. Test category/top filters and copying. Verify the old Hello Board and profile/photo features still work.
8. Run the RLS audit above. Verify every public table reports `rowsecurity = true`.
9. Collect PM feedback, document concrete before/after behavior, implement it, and repeat affected checks. Do not substitute the initial product hypotheses for actual feedback.
10. Submit the final commit-specific `/captions` URL after live AI creation, voting, and sign-in have been verified.

Sources: [Gemini REST API](https://ai.google.dev/api/generate-content), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
