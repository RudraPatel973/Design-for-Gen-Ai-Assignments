# The Hello Project

A maximalist Hello World app built with Next.js, React, and TypeScript, scaffolded with `create-next-app`.

Pink and yellow oversized letters bounce into place automatically on arrival. Includes a replay button, responsive layouts, keyboard focus styles, and support for reduced motion. All visuals and fonts are local; no API keys or environment variables are needed.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Validate

```bash
npm run lint
npm run build
npm start
```

## Deploy to Vercel

1. Create your Vercel account and connect GitHub.
2. Add a new project and import `RudraPatel973/Design-for-Gen-Ai-Assignments`.
3. Keep the root directory as the repository root and the framework preset as **Next.js**. Use the default install/build settings. No environment variables are required.
4. Deploy and wait for the deployment to show **Ready**.
5. Open the project's **Deployment Protection** settings and disable **Vercel Authentication** (and any other enabled protection), then save.
6. Open the deployment details for the submitted Git commit and copy its unique deployment URL. Use this deployment-specific URL rather than the moving production or branch alias.
7. Open that exact URL in an Incognito/Private window. Confirm the page opens without login and the greeting animates.
8. Submit that URL in the assignment's Submissions section.

References: [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), [Generated deployment URLs](https://vercel.com/docs/deployments/generated-urls).
