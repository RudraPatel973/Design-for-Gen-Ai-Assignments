# The Hello Project

The same Next.js app from Assignment 1, extended with a Supabase-backed **Hello Board** for Assignment 2.

- `/`: the original animated, maximalist Hello World page.
- `/greetings`: a responsive list of greetings fetched from Supabase at request time, with loading, empty, missing-configuration, and error states.

## Local setup

Requires Node.js 22 or newer.

```bash
npm ci
cp .env.example .env.local
```

Fill in `.env.local` using your Supabase project URL and public anon key (a publishable key also works):

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

These variables are read only on the server. `.env.local` is ignored by Git. Do not use a service-role or secret key.

In your Supabase project's SQL Editor, run [the migration](supabase/migrations/202609240001_create_greetings.sql) once. It creates `public.greetings`, inserts nine greetings, enables row-level security, and grants visitors read-only access. Rows have `id`, `phrase`, `language`, and `description` fields. Add or edit rows with the Supabase Table Editor; refresh the list page to see changes.

```bash
npm run dev
```

Open http://localhost:3000/greetings. The home page also links to the board.

The app does not substitute hardcoded sample cards when Supabase is unavailable. The sample greetings live in the SQL seed and only appear when returned by the database. A successful build alone does not prove the live database connection is configured.

## Validation

```bash
npm run lint
npm run build
npm start
```

Confirm `/greetings` displays the seeded database rows. Edit one description in Supabase, refresh, and confirm the change appears. Restore the description if desired. The homepage should still animate and its replay button should still work.

## Redeploy the existing Vercel project

1. Use the existing Vercel project connected to `RudraPatel973/Design-for-Gen-Ai-Assignments`, branch `main`, framework **Next.js**, root directory `.`.
2. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the project's environment variables for Production and Preview. Use the same values as `.env.local`.
3. Push the assignment commit to `main` to trigger deployment. If the commit was already deployed before the variables were added, redeploy it afterward.
4. Wait for **Ready**, then open `/greetings` and confirm actual database cards appear.
5. Open the project's **Deployment Protection** settings, disable **Vercel Authentication** and any other enabled protection, and save.
6. Open the deployment details and verify its source commit matches the Assignment 2 commit. Copy its unique deployment URL, rather than the moving production or branch alias. Add `/greetings` to link directly to the list page.
7. Open that exact URL in an Incognito/Private window. Confirm there is no login prompt and the greetings load.
8. Submit this deployment-specific list-page URL in the assignment's Submissions section.

## Troubleshooting

- **“The board is getting ready”**: set both environment variables, restart the local server, or redeploy in Vercel.
- **“Our hellos are taking a little break”**: check the URL/key, project availability, and whether the migration ran successfully.
- **“The first hello is on its way”**: check the table has rows and the SELECT policy allows `anon` reads.
- **Git push authentication error**: sign into GitHub in IntelliJ and use Git → Push.
- **Vercel CLI token error**: run `vercel login` before using CLI deployment commands.

References: [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), [deployment-specific URLs](https://vercel.com/docs/deployments/generated-urls).
