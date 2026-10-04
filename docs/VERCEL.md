# First Vercel deployment

Status 2026-10-04: P2 accepted by user; deployment preparation requested.
Local repo has no Git remote and no .vercel project link. No deployment URL available.
Basic Open Graph fields/image are absent from current app metadata; Antigravity implements
only docs/prompts/VERCEL.md while the controller waits for its report.

User steps:
1. Create an empty GitHub repository (private is fine); do not initialize README,
   license or .gitignore because the local repo already has history. Send its URL.
2. After preparation is verified and code is pushed, sign in to Vercel and choose
   Add New Project / import Git repository. Authorize access to this GitHub repo.
3. Select Next.js, root ./, install npm ci and build npm run build. Keep the default
   output directory. Leave ENABLE_FIT unset or 0. Deploy and send the resulting URL.
4. If the preparation report requires a site URL variable, set it to that real production
   URL and redeploy; controller checks resulting absolute Open Graph URLs.
5. Try sharing the URL in target apps and inspect its preview. Controller does not post
   messages on the user's behalf.

Controller steps:
- Verify executor code/report and build/tests, inspect repository before first push,
  add the actual GitHub remote and push when the destination is supplied and authorized.
- Verify deployed / and /dress-up, fonts, static PNGs, /fit 404 and OG image/metadata.
- Record exact URL, commit, results and outstanding issues. Do not declare this milestone
  complete until the live deployment checks have actually passed.

Sources checked 2026-10-04:
- https://vercel.com/docs/git
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
