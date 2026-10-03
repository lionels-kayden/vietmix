PHASE: 1 data and cultural-fit rule engine (no UI) [Scoped Fix]
STATUS: PASS
TASKS:
- T6 reproduce invalid scene suggested sets: ok, `npx vitest run lib/data.test.ts`, reproduced 3 expected failures (18 passed, 3 failed)
- T7 validate scene suggested set codes: ok, `npx vitest run lib/data.test.ts` (21 passed) and `npm run check` (build + 67 tests across 8 suites passed)
FILES CHANGED:
- [lib/data.ts](file:///e:/1.%20vietmix/lib/data.ts)
- [lib/data.test.ts](file:///e:/1.%20vietmix/lib/data.test.ts)
HOW TO RUN:
- `npx vitest run lib/data.test.ts`
- `npm run check` (runs Next.js production build and all 67 Vitest tests)
HOW TO TEST BY HAND:
1. Run `npx vitest run lib/data.test.ts` to verify the 21 tests in the data suite pass, covering items, presets, rules, scene suggested set validation, and `loadAll`.
2. Run `npm run check` to verify Next.js production build succeeds, TypeScript type check passes, and all 67 tests across 8 test suites pass.
3. Test validator behavior programmatically: call `validateScenes([{ id: 'test', name_vi: 'Test', remix_cap: 1, suggested_sets: ['INVALID'] }])` and verify it returns an error string detailing the invalid suggested set code.
4. Verify valid scenes: call `validateScenes([{ id: 'test', name_vi: 'Test', remix_cap: 1, suggested_sets: ['A', 'MIX'] }])` or with `suggested_sets: []` and verify it returns an empty array.
KNOWN ISSUES:
- Existing asset filenames encode set `A` prefix (`M_A_...` / `F_A_...`) instead of `COMMON`, and several suffixes differ from canonical kind names. Per project specifications, legacy filename and ID migration is deferred to Phase 3.
- All items in [data/items.json](file:///e:/1.%20vietmix/data/items.json) and rules in [data/rules.json](file:///e:/1.%20vietmix/data/rules.json) retain `needs_review: true` pending historical and cultural verification by domain experts.
LAST COMMIT: 9119d96 p1-t7: validate scene suggested set codes