# Assignment 3: account setup

Use the existing Supabase project and Vercel project. No new database or Vercel project is needed.

## 1. Create profiles, trigger, and photo storage

In the Supabase SQL Editor, run `supabase/migrations/202609300001_create_profiles.sql` once. It creates:

- `profiles` with nullable first/last names and an optional Storage file path.
- An `auth.users` insert trigger that creates a profile on first signup.
- Profiles for any existing accounts.
- A private `avatars` Storage bucket with a 2 MB limit.
- Row-level policies that only allow each user to read/edit their own profile and manage their own photos.

Do not rerun the Assignment 2 greetings migration. No binary images are stored in the profiles table.

## 2. Create your own Google OAuth client

Open Google Cloud Console → Google Auth Platform. Select or create a Google Cloud project, configure Branding/Audience (consent screen), and create a client under Clients:

- Application type: **Web application**.
- Authorized JavaScript origins:
  - `https://design-for-gen-ai-assignments.vercel.app`
  - `http://localhost:3000`
- Authorized redirect URI for **Google → Supabase**:
  - `https://fejfiqwgsnhuxxiydwsc.supabase.co/auth/v1/callback`

If the consent screen is in Testing mode, add your own Google email and any grader/tester emails as test users, or publish the app for the intended audience.

Copy the Google Client ID and Client Secret into **Supabase → Authentication → Sign In / Providers → Google**, enable Google, and save. Keep the client secret there, not in source code.

## 3. Configure the application callback in Supabase

Under **Authentication → URL Configuration**:

- Site URL: `https://design-for-gen-ai-assignments.vercel.app`
- Redirect URLs:
  - `https://design-for-gen-ai-assignments.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`
  - The exact new deployment URL followed by `/auth/callback` (provided after deployment).

The application passes exactly `<current-origin>/auth/callback` as `redirectTo`, without custom query parameters. Supabase adds the OAuth `code` when returning to the app; the callback exchanges it for a cookie session. The Google-provider callback above and this application callback are two separate steps in the same OAuth flow.

## 4. Environment and deployment

Keep the existing `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local` and the Vercel project. The auth implementation uses Server Actions and a server-side SSR client, so it needs no browser-exposed environment variables or Google secret in Next.js.

`proxy.ts` refreshes cookie sessions. Protected pages and profile updates independently call `getUser()` to verify the current user. `/club` also requires both names. Public greetings remain accessible without login.

Push the commit to the same GitHub repository and deploy the same Vercel project. Keep Vercel deployment protection off: visitors must reach the app's own login page, rather than Vercel's login.

## 5. Verify end to end

1. In Incognito, open `/club` and `/profile`: each must redirect to `/login` without showing private content.
2. Continue with Google. A first signup should create one `profiles` row with the same UUID as the `auth.users` row.
3. After applying `202610110002_google_profile_defaults.sql`, Google names and photo are imported automatically. Only names still missing after import must lead to `/profile`. Attempting `/club` must still return to `/profile`.
4. Enter both names, optionally upload a JPEG/PNG/WebP smaller than 2 MB, then save.
5. Enter `/club`: the page should greet you by first name.
6. Edit your names and upload a new photo. Refresh to verify persistence. Storage should hold the file; `profiles.avatar_path` should hold only a path.
7. Sign out and verify both protected routes redirect to login again.
8. Repeat with a second Google account: it must have its own profile and no access to the first user's photo/profile through the API.
9. Open the commit-specific URL in a new Incognito window and submit it after the above checks pass.

The live Google consent flow must be tested with your Google account after configuring the provider; passing a build does not verify OAuth.

Sources: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [user profile triggers](https://supabase.com/docs/guides/auth/managing-user-data).
