Read PROJECT.md and docs/reports/P2-verification.md. Continue in the SAME P2 conversation.
This is a scoped P2 fix, EXECUTOR=antigravity. Follow WORKING RULES: tasks in order,
check and commit each; at most 3 repair attempts per failed check, then FAILURE REPORT.
Keep all existing tests; no new dependencies, data/assets migration or later-phase work.

T6. Fix failed garment rendering.
CharacterCanvas's full-canvas gray fallback currently overlays lower layers (especially
when a head image fails at zIndex 50). Replace it with a bounded, labeled gray placeholder
or error area that leaves the character and successfully loaded garment layers visible.
Do not alter successful layers' order or fit transforms. Add regression coverage using a
failed head image with successful body/top/bottom/shoes; preserve existing fallback tests
and strengthen them beyond merely checking lower images remain in the DOM.
Check: targeted CharacterCanvas tests pass; inspect the failure in a browser at phone
and desktop widths without changing source assets. Document checks not possible.
Commit: "p2-t6: prevent image fallback from obscuring outfit"

T7. Add the required gentle garment entry motion.
Animate an inner visual element when equipping/replacing an item so the outer fit layer's
translate/scale is preserved. Suppress motion for prefers-reduced-motion: reduce. Avoid
replaying all equipped garments when changing an unrelated item.
Check: verify an item with nonzero fit offsets and scale retains final positioning;
inspect entry motion and reduced-motion behavior in a browser. Add a meaningful
regression check for fit-transform preservation. Run npm run check.
Commit: "p2-t7: add reduced-motion-aware garment entry"

After both tasks, run npm run check once more, then STOP and print the PHASE REPORT with
actual test totals, LAST COMMIT and any visual checks not performed. Do not claim JSDOM
proves pixel visibility or visual quality. Do not edit controller docs, create tags,
deploy or start another phase.
