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
