Read PROJECT.md and docs/CONTROLLER.md. Post-P2 milestone: first Vercel deployment
preparation. EXECUTOR=antigravity. P2 is accepted; do not start P3 or full P8 sharing.
Follow WORKING RULES: numbered tasks in order, check and commit each, retry failed
checks at most 3 times then FAILURE REPORT. Preserve tests; no new dependencies.

T1. Basic Open Graph metadata.
Check current official Next.js metadata docs. Add Vietnamese title, description,
locale vi_VN, website type and an OG image using the established design direction.
Use a static PNG or built-in Next.js ImageResponse (no external generation service).
Verify Vietnamese glyphs in the actual image. Configure absolute metadata URLs using
an explicit production site URL env variable, with Vercel deployment URL fallback and
localhost only for local development; never invent a deployed hostname. Document the
variable and how to set it after the first URL exists. No share buttons or direct posting.
Check rendered production HTML contains the OG title/description/image; image URL
resolves with image content type. Add focused metadata configuration tests where useful.
Commit: "deploy-t1: add basic Open Graph metadata"

T2. Vercel readiness and handoff.
Keep npm run build as the Vercel build command so prebuild sync copies source PNGs to
public/assets. Verify all 22 source images are tracked and synced. Keep ENABLE_FIT unset
or 0; /fit must be 404. No runtime file writes. Record Next.js framework preset, root ./,
install npm ci and build npm run build in a short README deployment section; let Vercel
manage its output directory. No database or secrets are required for this milestone.
Check npm run check; smoke-test production / and /dress-up, static images and /fit 404.
Commit: "deploy-t2: document and verify Vercel readiness"

Run npm run check after commits, STOP and print the PHASE REPORT. Report exact metadata
URL configuration, tests performed and browser checks unavailable. Do not edit controller
reports/CURRENT STATE, create tags, push, connect accounts, or deploy. The user connects
GitHub/Vercel; controller reviews the report and validates the real URL after deployment.
