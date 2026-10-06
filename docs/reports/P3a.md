# P3a controller execution report

PHASE: P3a, EXECUTOR=self

STATUS: PARTIAL — pipeline implemented and tested; garment acceptance pending.

## Tasks

- T1: 14 legacy IDs/filenames migrated with runtime references and regression tests;
  PROJECT.md catalog made color-free. Commit afec6e0.
- T2: border flood fill, component/gap extraction, transparent normalization.
  Commit 7b48847; T4 adds hash-guarded background seeds for enclosed female arm gaps.
- T3: canonical filename kind parsing, variant parsing, pixel color scan and source
  hashes. Commit ea6ec3c. 18 mapped layers extracted from preserved originals.
- T4: measured contour draft anchors, uniform fits, separate foot placement,
  fit diagnostics and reviewed-only defaults learning. All outputs remain unapproved.
  Commit 9e4860f.

## How to run

From repository root, install pipeline/requirements.txt if needed, then:

```powershell
python pipeline/image_core.py
python pipeline/manifest.py
python pipeline/fit_auto.py
python -m pytest pipeline -q
npm run check
```

Generated artifacts: reports/p3a/extracted, manifest.json, anchors-draft.json,
fit-report.json, layers, previews and outfits-draft.jpg. Original sources remain in
image-input. No candidate real image has replaced a runtime placeholder.

All layers are already baked to 1080x1920; use identity x=0,y=0,scale=1 for those
layers. Fit report x/y/scale describe the extracted source transform, not a second
transform to apply to a baked image. Shoe part_transforms describe each source shoe.

learn_defaults.py takes a fit-report-shaped mapping with explicit gender/slot and
approval metadata, an existing defaults JSON, and --output to a different path. It
does not infer approval from the current runtime fit.json and does not overwrite inputs.

## Verification and visual findings (2026-10-06)

- npm run check: production build and 103 tests / 15 files passed.
- Python: 20 tests passed, including enclosed whites, explicit background seeds,
  overlapping sheet projections, filename parsing, color scanning, shifting measured
  anchors, mismatch thresholds, separate foot placement, hem length and default safety.
- Current numerical fit report: 0 PASS, 16 WARN, 2 FAIL. These are heuristic geometry
  results, NOT a complete visual acceptance test.
- Viewed the regenerated six-set contact sheet. Female shoulders remain exposed.
  Male A has visible arm strips; male C hides hands. Female sleeve/hand coverage also
  needs correction. These visual defects prevent outfit acceptance even where geometry
  is only WARN. Redrawing sleeves is required by the existing decision; do not trim them.
- Female trousers: waist/length scale disagreement about 35.6%; skirt about 23.5%.
  Both FAIL. Preview uses uniform length fit, which leaves excessive waist width.
  Do not hide these failures using anisotropic distortion.
- Shoes now follow each foot. Toe edges, perspective and ankle transitions still need
  close review; placement does not prove complete skin coverage.
- Collar heights and shoulder landmarks are heuristic contour extrema. Navel is NOT
  detected (null). Bottoms align to measured narrow waist, not a verified navel.
- All source-name-derived cultural classifications remain needs_review. Source naming
  and visible collar construction may disagree; no automatic relabeling was performed.
- Modern trousers, necklaces and some accessories have no supplied real counterpart;
  generated draft layers do not constitute the complete runtime catalog.
- Background edges may retain a pale fringe. Enclosed garment whites are intentionally
  preserved. No image pixels were redrawn or recolored.

## Manual checklist

Open reports/p3a/outfits-draft.jpg and individual previews at full size:

1. Neck/collar centered; shoulders covered without stretching motifs.
2. Arms sit inside sleeves; hands are visible below cuffs.
3. Base underwear fully covered (also inspect bottoms without a top).
4. Waist, trouser/skirt hem and ankle look plausible; neither hem nor accessories clip.
5. Each shoe covers its own foot; no toes or side skin escape.
6. No white background islands/fringe; white garments remain opaque.
7. Compare with originals: motifs, silhouette and proportions preserved.

Next: resolve failed source proportions and sleeve silhouettes, review remaining fits,
then promote accepted layers. P3b and p3a-ok are not authorized by this report.
