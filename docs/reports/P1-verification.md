# P1 controller verification — 2026-10-03

Executor: antigravity. Implementation reviewed: a52cbbb.
Executor report is preserved verbatim in P1.md; this review does not alter its PASS claim.
Original verdict: PARTIAL. Current verdict: PASS after the scoped fix; see resolution below. User acceptance remains pending.

## Checks actually run
- npm run check: exit 0; production build succeeded; 63 tests passed across 8 files.
- Read items.json, presets.json, RULES.md, validators, rule engine, remix helpers and tests.
- Git confirms separate P1 T1–T5 commits ending at a52cbbb.
- 20 items (9 male, 11 female); image existence, unique IDs, kinds and review flags pass
  the existing tests. The 10 preset compositions match the issued prompt, including
  female Set B with a skirt and RX-02 with a necklace. Integration tests pass with no
  block/warn hits for all presets. RULES.md lists the requested 10 rules.
- No browser/manual visual check or cultural-source verification was performed.
- npm run check includes build and Vitest, not ESLint or Python pipeline tests.

## Findings beyond the executor report
1. T2 validation gap: validateScenes only checks that suggested_sets is an array.
   An in-memory probe used a real scene with suggested_sets: ['INVALID'].
   validateScenes returned []; loadAll({scenes: [scene]}) accepted it. No files were
   changed by this probe. Current real scene data is valid, but unknown set codes are
   not rejected. Add element validation and a regression test in the P1 executor fix;
   preserve valid empty arrays. This follows T2's rejection of unknown enum values.
2. Filename mismatch is broader than the reported COMMON prefixes: 9 files have A
   instead of COMMON, and 14 of 20 filename suffixes differ from their canonical kind.
   This includes beige_trousers, sneakers and black_skirt as well as common items.
   P1 explicitly required preserving existing filenames, so this is P3 migration work.
3. Cultural messages contain categorical claims, while all rules are needs_review=true.
   RULES.md itself does not display that flag. Keep all 10 rows pending cultural review;
   passing tests establishes behavior, not historical accuracy. All 20 item sources are
   empty and their needs_review flags are true, as required by the P1 prompt.
4. evaluate ignores unknown IDs and does not enforce outfit.gender. canConfirm means
   only that no block rule fired (even an empty outfit can confirm). Future outfit/UI
   validation must not treat this result as proof that an outfit is complete or valid.
5. PROJECT.md still hardcodes colors. The P3 plan already mentions pixel color scanning;
   the outstanding work is catalog alignment and implementation, not adding that plan.

## Proposed P3 filename migration (not implemented)
- Use a reviewed, explicit old filename -> canonical filename mapping, never image
  appearance to infer kind. Normalize to {M|F}_{set}_{SLOT}_{kind}[_{variant}].png.
- Examples: M_A_BOTTOM_white_silk_trousers.png -> M_COMMON_BOTTOM_quan_lua_trang.png;
  F_B_BOTTOM_black_skirt.png -> F_B_BOTTOM_vay_dai.png;
  M_MIX_BOTTOM_beige_trousers.png -> M_MIX_BOTTOM_quan_hien_dai.png.
- Dry-run all mappings first; reject collisions and unknown names. Keep base filenames.
  Parse known kinds using the canonical kind list (kinds themselves contain underscores),
  then parse an optional variant suffix. Reject ambiguous or unrecognized names.
- Because P1 IDs equal filename stems, migrate IDs and every reference together:
  presets, tests, image paths, fit/anchors/manifest keys and any references added in P2.
  Keep an old-ID mapping if persisted outfits exist by then. Update the placeholder
  generator too, so rerunning it cannot restore legacy names.
- Check all images and references resolve; no duplicate IDs or filename collisions;
  filename gender/set/slot/kind matches metadata; default variants preserve preset
  compositions and rule results. Run build + tests after migration.
- Scan dominant colors from real image pixels independently of kind. Placeholder gray
  is not a real garment color. Keep existing canonical kind identifiers unchanged.

## Human review checklist
- Review the 10 draft messages in docs/RULES.md; confirm any cultural changes separately.
- P1 has no dress-up UI; visual outfit acceptance belongs to later phases.
- Fix/review the validator gap before P1 acceptance. The controller creates p1-ok only
  after the user says "đạt"; a P2 prompt requires a separate "tiếp" instruction.
## Scoped-fix resolution — 2026-10-03
- Read the verbatim fix report (P1-fix.md) and inspected commits 5338de5 and 9119d96.
- The fix touches only lib/data.ts and lib/data.test.ts. validateScenes reuses VALID_SETS
  and checks each suggested set's type and value; errors include scene, index and value.
  loadAll rejects those errors through its existing aggregation.
- Regression coverage includes INVALID, mixed valid/invalid entries, null/123, empty
  arrays, all five valid codes, loadAll rejection, and real repository data acceptance.
- Controller ran npm run check: exit 0; production build and all 67 tests / 8 files pass.
- The earlier T2 gap is resolved. Original findings above are retained as review history;
  filename migration remains P3a and cultural content remains needs_review=true.
- No browser/visual check is needed for this validator-only fix; no visual claim is made.
- No new blocking issue found in this scoped review. Ready for the user's "đạt";
  no acceptance tag or next-phase prompt is issued from the question "ok chưa nhỉ".
