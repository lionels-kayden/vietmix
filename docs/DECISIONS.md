# Decisions

- 2026-10-03: User acts as relay to Antigravity. Controller saves verbatim reports,
  verifies them, updates CURRENT STATE and commits docs automatically while executor
  is idle. Reason: remove manual project bookkeeping from the user.
- 2026-10-03: User saying "đạt" authorizes the phase acceptance tag p<N>-ok;
  "tiếp" authorizes the next phase prompt after verification. An executor PASS alone
  authorizes neither. Reason: keep acceptance and advancement explicit.
- 2026-10-03: Record P0 only as user-reported PASS at dd7f391 because its full report
  was not supplied. Keep the original P1 report separate from controller findings.
- 2026-10-03: Record the previously authorized DESIGN DIRECTION addition to PROJECT.md
  (commit 6021917): warm cream/red/indigo palette, restrained folk-art inspiration,
  mobile-first interaction, Vietnamese typography, reduced motion and cautious copy.
  Reason: establish a consistent visual direction from P2 onward.
- 2026-10-03: Revise CONTROLLER.md and add PROJECT.md delivery guidance: P3a is controller
  EXECUTOR=self for pipeline T1-T4 and pipeline tests with a visual checklist; P3b is
  Antigravity's /fit UI. Include learn_defaults in P3a and pass its formats to P3b.
  Reason: explicit ownership and one active executor at a time.
- 2026-10-03: Add docs/ROADMAP.md and update the controller phase plan. Phase order is
  flexible; ask about drawing progress before selecting work. P3a then P3b run when real
  images are ready, both before P7. Reason: avoid blocking P4-P6 on artwork.
- 2026-10-03: Add first Vercel deployment immediately after accepted P2. User connects
  GitHub/Vercel; controller prepares and verifies; Antigravity implements required app
  changes/basic OG. Full sharing stays P8. Reason: test real links/previews early.
- 2026-10-03: Schedule color-free PROJECT.md catalog and filename migration in P3a;
  conditionally add same-kind image variant UI after P5 and P3a if variants exist.
  Reason: honor filename-derived kinds and the brief's color-choice requirement.
- 2026-10-03: User authorizes controller edits to PROJECT.md; every documentation
  revision is logged here. Preserve CONTROLLER.md DECIDED verbatim and ask before any
  change there. Current-state note now acknowledges unverified P1 fix commits
  5338de5/9119d96; no acceptance or tag is inferred.

- 2026-10-03: Add docs/image/FIT_NOTES.md verbatim from the user's manual compositing
  observations. Measurements are visual estimates, not fixed pipeline constants; during
  P3a remeasure landmarks and scale in code from the real canonical base images and each
  sheet's reference character. Reason: preserve useful observations without hardcoding
  unverified measurements. No change to CONTROLLER.md DECIDED.

- 2026-10-03: Archive the P1 scoped-fix report verbatim in P1-fix.md, append the
  verification resolution to P1-verification.md and update CONTROLLER.md CURRENT STATE
  to controller-verified PASS. Reason: fix inspected and build + 67 tests passed.
  User acceptance remains pending; no tag or next-phase prompt. DECIDED unchanged.

- 2026-10-04: User accepted P1 and requested P2 in natural language. Record acceptance
  in CONTROLLER.md and create p1-ok at this documentation commit; latest verified P1
  implementation is 9119d96, with build + 67 tests rechecked today. Add the P2 prompt
  for Antigravity using existing placeholders; ask drawing progress to schedule P3.
  No DECIDED changes; no application implementation in this controller turn.

- 2026-10-04: User reports real 2D characters and garment images exist but need scale
  alignment. Update CURRENT STATE; P2 still uses placeholders. Plan P3a image intake
  after P2 and first Vercel deployment; image paths and actual fit remain unverified.

- 2026-10-04: Archive verbatim P2 report, add P2-verification.md and scoped P2-fix.md,
  update CURRENT STATE to PARTIAL. Build + 100 tests passed; source review found
  full-canvas garment error overlays and missing required entry motion. No code edits,
  acceptance tag or phase advancement. DECIDED unchanged.

- 2026-10-04: Save verbatim P2-fix.md, append verification resolution and update
  CONTROLLER.md: T6-T7 code fixes verified; build + 103 tests pass. Browser visual
  verification and user acceptance remain pending. Record the pasted log's untracked
  instruction-file deletion as unverified context; no code changes or acceptance tag.

- 2026-10-04: User requests the post-P2 Vercel milestone after hand-testing P2.
  Record P2 acceptance and tag p2-ok; add VERCEL guide and executor preparation prompt.
  Repo has no remote/project URL and lacks OG metadata/image. Controller prepares and
  verifies; Antigravity implements; user connects accounts. No deployment claimed.

- 2026-10-05: Save image-input sources and selected matching black/white cloth-shoe
  designs; retain earlier sneaker as alternative. Record 17-image format inventory
  after decoding each file. User labels trousers traditional; no historical validation
  or catalog change inferred. Fit remains pending.
- 2026-10-05: Synchronize CONTROLLER.md, PROJECT.md, ROADMAP.md and VERCEL.md with
  user's earlier explicit postponement: local P3a first, deployment before P8 live tests.
  DECIDED unchanged. Source choices appended to image-input/notes.txt.

- 2026-10-05: User requests repository research then autonomous P3a execution. Read two
  reference repos (docs/image/REFERENCES.md), adopt layer/variant workflow only; no code
  or art copied. T1 migrates 14 legacy IDs and filenames, updates runtime references and
  PROJECT.md color-free catalog. source_map.json records user-name-derived kinds;
  trouser-family mapping and generated variants remain reviewable. DECIDED unchanged.

- 2026-10-06: Record P3a self-execution in reports/P3a.md and CONTROLLER CURRENT STATE.
  Pipeline code tests pass, visual acceptance remains PARTIAL. Keep candidate assets in
  reports/p3a rather than promoting flawed fits. Two explicitly inspected, hash-guarded
  background seeds remove enclosed female base arm gaps without white-keying garments.
  Fit uniformly to measured bottom length and independently measured feet; report
  incompatible waist proportions and sleeve defects. Preserve originals and DECIDED.

- 2026-10-06: User corrects the blanket sleeve-redraw diagnosis. Record conditional
  cuff/hand masking analysis in image/OCCLUSION_REVIEW.md and author a local
  garment-2d-fit skill from official layer/mask references. Inspect opening geometry
  before diagnosing excessive sleeve length. No assets, runtime or DECIDED changes.

- 2026-10-06: User rejects batch combination fits and requests sequential fitting to the
  approved style reference. Archive the batch as REJECTED_FIT; produce male A as separate
  transparent layers on the exact original base. AI edits supply garment pixels only.
  Record scoped masks, sources, tests and remaining visual limitations in
  reports/P3a-single-A.md. CURRENT STATE updated; DECIDED unchanged; no acceptance tag.

- 2026-10-06: User accepts only the direction of the collar, requests visual rules from
  the demo for cuffs/hands and pants/shoes. Add image/FIT_VISUAL_RULES.md with observed
  defects, local correction order and separate visual acceptance. Mark single-A as
  CHANGES REQUESTED. Preserve verbatim FIT_NOTES, assets and CONTROLLER DECIDED.

- 2026-10-06: Implement requested male-A revision 2 with localized cuff recovery,
  folded trouser hems and revised shoe artwork. Preserve original base/collar/hands;
  record shoe-specific reversible foot mask and limited reuse under other tops in
  reports/P3a-single-A.md. Save AI prompt/source and test recovery. No DECIDED change.

- 2026-10-06: User says "được chấp nhận" for male A revision 2 (f3c6a06).
  Record single-outfit visual acceptance in CURRENT STATE, P3a-single-A report and
  v2/ACCEPTANCE.md. It becomes the visual reference for subsequent fits. Other outfits
  and P3a remain incomplete; no phase tag or cultural approval. DECIDED unchanged.
