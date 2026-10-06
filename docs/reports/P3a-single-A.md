# P3a — single male A fitting checkpoint

Status: CHANGES REQUESTED (2026-10-06), not phase acceptance. The previous 36-combination pack was
rejected by the user for poor fitting and is retained only as an experiment.

## Delivered
- reports/p3a-single-A/index.html: toggle real base/shoes/bottom/top PNG layers.
- Original normalized character remains pixel-identical; no generated face/body adopted.
- Body-contour shoulder correction, registered garment-only AI polish, localized button
  corrections (five visible buttons), and independent shoe enlargement/placement.
- Source images and hashes retained; original image-input and runtime assets unchanged.
- Rebuild: python pipeline/single_outfit.py. These coordinates are specific to this
  inspected source, not general anatomical constants or a universal fitting algorithm.

## Verification and limits
- 27 pipeline tests pass, including original-base identity, exact layer recomposition,
  unchanged face, shoulder/arm coverage regression and exposed hand sample points.
- Coverage diagnostic leaves 44 pixels in its manually selected, eroded torso/arm ROI.
  This is not a general proof of no exposed skin or aesthetic acceptance.
- Visual inspection: collar/shoulders meet the body, hands emerge below cuffs, feet fit
  inside the shoes. Pants retain a straight illustrated hem, unlike the folded reference.
- AI garment motifs/folds differ from original artwork. Cultural accuracy remains unverified.
- Other outfits have not been rebuilt to this standard. No P3b handoff or p3a-ok tag.

## User visual checklist
- Neck and shoulder silhouette at full size; no skin slivers or cream halos.
- Cuffs connect naturally to the original wrists, without clipped or duplicated hands.
- Toggle top off: base is intact; toggle back on: underwear is covered.
- Check five buttons, motif quality, trouser width and hem/shoe junction.
- Judge both phone-size and enlarged views. Review before reusing this fitting approach.

Application verification: npm run check passed (production build + 103 tests / 15 files).

User review correction: collar is satisfactory, but hand/cuff connection and pants/shoe
proportions are not accepted. Earlier visual wording above describes visibility only,
not convincing fit. Follow docs/image/FIT_VISUAL_RULES.md before further asset changes.
