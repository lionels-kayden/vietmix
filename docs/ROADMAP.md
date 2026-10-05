# Delivery roadmap

Planning only; this does not issue a phase prompt or start execution.
Default executor: Antigravity. Controller implements only P3a as authorized.
Ask the user about drawing progress before deciding the next phase. P3a -> P3b can
move around P4-P6 as images become ready; both must complete before P7.
Only one executor runs at a time. Every phase requires checks, report and acceptance.

## P2 — Core dress-up
T1: Design foundation, Vietnamese fonts and mobile layout.
T2: Character selection and gender-specific outfit state.
T3: Layered renderer and fit.json offsets.
T4: Item tabs, put on/take off and single-item slots.
T5: Ten presets and integration checks.
Hand-test: switch characters, replace/remove items, apply presets, inspect layering,
Vietnamese diacritics and one-handed use on a phone.

## Deferred until after local development, before P8 — First Vercel deployment
T1: Controller prepares a deployment checklist and repository/build handoff; Antigravity
implements any needed app/config changes and basic Open Graph title, description/image.
T2: User signs in and connects the GitHub repository to Vercel, grants account permissions
and selects the project/repository; user provides the resulting deployment URL.
T3: Controller checks the deployed build, public routes, asset/font loading, /fit 404,
Open Graph metadata and real-link previews; reports failures and writes scoped fixes.
T4: User tries sharing that real URL in their target apps; controller records results.
Hand-test: open the public URL on a phone, refresh, share the link and inspect its preview.
Scope: early link/OG smoke test; PNG/Web Share and full platform flows remain P8.
The controller handles preparation and verification; this milestone does not authorize
controller app-code implementation or concurrent work with Antigravity.

## P3a — Image pipeline (EXECUTOR=self, real images required)
T1: Inventory real images; agree names; migrate legacy filenames/IDs/references; replace
PROJECT.md's fixed-color catalog with the already-decided color-free specification.
T2: Ingest, sprite-sheet crop, border flood-fill background removal and normalization.
T3: Canonical filename kind/variant parsing, pixel color scanning and manifest.
T4: Anchor alignment, fit_auto PASS/WARN/FAIL, previews and learn_defaults preserving
user values; define fit formats for the subsequent /fit handoff.
Checks: automated tests in pipeline/ for each task, migration/reference consistency,
fit thresholds and defaults preservation; run relevant app integration/build tests.
Hand-test checklist supplied with the report: inspect white trousers for holes; edges
for halos/cropping; neck, waist, ankle and shoulder alignment; exposed hands; layer order;
correct item/variant identity; compare originals to previews for unintended alterations.
Only claim visual checks actually performed. User visual acceptance is separate from tests.

## P3b — Hidden /fit page (EXECUTOR=antigravity)
T1: Internal route and ENABLE_FIT gating using verified P3a formats.
T2: Alignment UI and overlay previews.
T3: Local fit-data export/import handoff to the pipeline; no production route file writes.
T4: Route, UI and fit-data integration tests.
Hand-test: enable /fit locally, align an item, round-trip fit data, inspect the dress-up
result, then disable it and confirm 404; confirm no public navigation link exists.

## P4 — Scenes and Remix slider
T1: Four simple SVG scenes and scene selection.
T2: Classic–Remix slider at 0/1/2.
T3: Scene caps and non-binding set suggestions.
T4: Flow/state integration and gentle motion.
Hand-test: switch all scenes, move slider, check caps 1/1/2/2 and optional suggestions.

## P5 — Story cards
T1: Static content, recorded sources and needs_review flags.
T2: Content schema/reference checks.
T3: Item cards, flipping and review badge.
T4: Dress-up flow integration.
Hand-test: read/flip cards, follow sources, inspect review labels, small screens and
reduced-motion behavior.

## After P5 — Variant selection (conditional; requires P3a)
T1: Confirm multiple real variants are available and use the P3a manifest grouping.
T2: Same-kind image selector with thumbnails/color labels derived from image data.
T3: Preserve one item per slot and kind-based behavior; presets use default variants.
T4: Verify selection, rendering and references; integrate with result/export when present.
Hand-test: select two variants of one kind, confirm the image changes without recoloring,
check slot replacement and preset defaults. If variants are unavailable, defer this task
and record that user-facing color selection remains pending; do not claim it is delivered.

## P6 — Confirm outfit
T1: Whole-outfit rules on confirmation.
T2: Block/warn/suggest feedback and return-to-edit flow.
T3: Summary assembly from preset or content fragments.
T4: Result page and outfit cards.
Hand-test: block invalid combinations, inspect warnings, revise/reconfirm, compare summary.

## P7 — Export and Lookbook (requires accepted P3a and P3b)
T1: Canvas composition at 1080x1350.
T2: PNG download and error handling.
T3: localStorage save/view/delete.
T4: Empty/corrupt/unavailable storage states and integration checks.
Hand-test: inspect exported image/text, save/reload/delete, try unavailable storage.

## P8 — Full sharing
T1: Verify current official platform documentation.
T2: Web Share with PNG where supported.
T3: Platform link buttons using the deployed URL.
T4: Download/copy-caption fallback and complete Open Graph verification.
Hand-test: share/cancel on a phone, use fallback, inspect caption/link/preview.

## P9 — Polish and deployment readiness
T1: Responsive layout and touch targets.
T2: Keyboard access, contrast, Vietnamese text and reduced motion.
T3: Empty/error states and offline behavior after load.
T4: Production /fit 404 and no route filesystem writes.
T5: README, deployment instructions and full-flow checks on Vercel.
Hand-test: full journey on phone/desktop, refresh, network loss after load and error states.
