# P3a batch 02 — male B/C and independent lower layers

2026-10-06. Status: REVIEW REQUIRED. User requests 2-3 images per report.

## Work and correction
Male B (source filename ao_giao_linh) retains geometric medallions/red trim. Male C
(ao_tac) retains black/gold artwork and wide sleeves. Generated cloth alone is recovered
onto the exact original body. Source hashes, prompts and masks are saved with each.
B's source has a standing collar despite its name; no cultural relabeling or approval.

User observed that prior pants/shoes failed when shown alone: upper trousers were spliced
to a visible lower fragment; shoes retained trouser fragments and lacked hidden uppers.
Those earlier composite-only results were not sufficient proof of reusable assets.

Rebuilt FULL independent pants and FULL shoes in reports/p3a-lower-v3/. Pants have a
continuous waist/crotch/knee/hem design. Measured inner-leg correction (max about 13px)
covers the original body's inner knees without hiding the legs. Shoe collars/uppers are
complete; annotated openings reveal original ankle pixels. A shoe-specific visibility
mask hides feet below the vamp and is removed when shoes are off. Original base remains
unchanged. Layer order is body, shoes, pants, top. No clipped upper shoe substitute.

The batch B/C review now uses these lower layers. Accepted A v2 is preserved as a historical
snapshot; its lower assets must not be promoted to runtime. A new full-outfit approval
does not automatically approve every combination or cultural claim.

## Verification
39 pipeline tests pass, including four lower-layer states, pants-over-shoes overlap,
original body identity, inner leg/underwear coverage, complete garment extents, unchanged
hands/face, closed background gap removal and scoped asset copies. Runtime code/data
unchanged; npm run check was not rerun for this image-only checkpoint.

Visual checks: separate pants, separate shoes, pants/shoes together, B/C full outfits,
cuff close-ups and contrasting backgrounds. Thin extraction fringe remains visible at
some edges, notably original hair/hands; final edge cleanup remains before promotion.
Manual source-specific anchors are hash guarded, not general detected anatomy.

## User review
Open http://127.0.0.1:8768/; use Chỉ quần, Chỉ giày, Quần + giày, Cả bộ.
Check uninterrupted trouser folds/crotch, no inner-knee skin leak, complete shoes without
white trouser scraps, ankles joining collars, hems covering shoe uppers, and restored bare
feet when shoes are removed. Judge B/C collars, cuffs and overall silhouettes together.

Rebuild: python pipeline/lower_v3.py then python pipeline/batch_02.py.

Browser verified on 2026-10-06: Chỉ giày renders only original body with shoe-specific
mask plus complete shoes; Chỉ quần restores the unmasked original body; Quần + giày
shows correct overlap. Screenshot: reports/p3a-batch-02/browser-check.png.
Account quota checkpoint: weekly usage 97%, remaining approximately 3%. Stop after this
commit as requested by user; no additional outfit generation started.
