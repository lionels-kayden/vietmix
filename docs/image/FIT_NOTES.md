# FIT_NOTES (từ các lần ghép thử)

BASE CHARACTERS
- Male: muscular, white boxer shorts, barefoot, feet slightly apart. Female: slim, black
  strapless top + black briefs, hair in a low bun, feet nearly together. Both: arms hanging
  about 10 degrees from the torso. Every garment must cover the base underwear.

SHEETS
- A generated sheet has the base character at left and 1 to 3 garments at right (about 3
  items, shoes empty). The left character is a RULER: measure its height in the same sheet
  and normalize each garment's scale before aligning to the canonical base. Sheet scale
  differs between images.
- Split items by empty gap columns, then by connected components.
- Background is off-white/cream, not pure white. Remove it by flood fill from the border
  (threshold on min channel about 232 to 235), keep the largest components, fill holes,
  light morphological opening to drop noise. White trousers have closed outlines so their
  interior is not connected to the border; never delete all white pixels.
- Ignore tiny corner marks (a faint sparkle watermark can appear at a bottom corner).

LANDMARKS (as ratios of head-top-to-feet height; estimates, verify by detection)
- collar top / neck base about 0.15; navel about 0.385; boxer top about 0.43 to 0.45;
  ankle about 0.93.

OBSERVED FITS
- Ao tac (wide sleeves, long): aligning the collar centre to the neck centre at uniform
  scale about 1.0 fit well. Skin showed at both shoulders (the character's shoulders are a
  little wider): use scale about 1.04 or a local shoulder stretch of 3 to 5 percent. Hem
  landed at mid to lower calf (accepted).
- One robe had cuffs ending below the hands (hands hidden); decision: redraw shorter sleeves
  so hands show, do not cut by code.
- A white wide-leg trousers sheet was too wide and too long: to put the waist at the navel
  and the hem at the ankle needed x-scale 0.86 vs y-scale 0.63 (23 points apart). That must
  report FAIL and ask for a redraw (straight legs, not flared), not be hidden by distortion.

CHECKS AFTER COMPOSITING
- skin-coloured pixels outside the garment silhouette near shoulders and arms
- underwear pixels still visible
- hands visible below the cuffs and not clipped
- garment layer above the body layer so the arm sits inside the sleeve
- width mismatch at waist and shoulders versus the body
