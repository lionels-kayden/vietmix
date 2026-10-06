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

## Revision 2 — cuffs and lower outfit
- Candidate: reports/p3a-single-A/v2/preview.jpg; local review at /v2/ on port 8767.
- Built-in imagegen supplies edited cloth/shoe artwork. Exact prompt and source retained
  in v2/PROMPT.md and ai-edit.png. Source hash guards manual recovery coordinates.
- Only two cuff regions replace the top; accepted collar/torso unchanged. Original face
  and hands retained. Pants lower section has soft folds; shoes show more vamp.
- Important limitation: shoes use a reversible body visibility mask below y=1710 because
  their new silhouette does not enclose every pixel of the original bare feet. Original
  base remains intact. Removing shoes must restore it. This is a body-specific trial,
  not a validated general shoe-fitting solution.
- Upper pants reuse prior artwork; the join is hidden by this tunic and is not yet
  approved for other tops. Runtime unchanged. Visual approval pending.
- 29 pipeline tests pass, including unchanged collar/body, exact composition and masks.
