# Layer production and combination review

User authorization (2026-10-06): approved the navy/white/black visual direction and
requested autonomous planning, layer preparation, combination checks and a review pack.
Approval concerns appearance, not completion of P3a or historical accuracy.

## Ordered work

1. Preserve the approved reference and inventory supported combinations. Keep original
   bases fixed. Record asset provenance and missing catalog art.
2. Prepare versioned 1080x1920 transparent candidates. Keep original artwork and any
   AI-assisted replacement distinct. Calibrate collar, cuff, waist and foot anchors;
   separate garment-specific hand/cuff occlusion when appropriate.
3. Compose every available top/bottom/shoe combination (18 per gender, 36 total),
   inspect accessory overlays separately, and provide a local layer review page.
4. Run invariant tests and visual inspection. Record each observed defect, missing
   item and unreviewed combination; user receives the report and review page.

The existing runtime remains unchanged until candidate review. No P3b implementation
or acceptance tag is implied. A montage that looks good does not prove reusable layers.
The renderer currently supports only one PNG per slot; experimental foreground masks
belong to this review pack until their integration contract is verified.

## Coverage

Each gender currently has 3 tops, 2 bottoms and 3 shoe variants in the source mapping.
Male head accessory: conical hat. Female head accessory: hairpin. Accessory absence is
also a supported state. Modern trousers and necklaces lack real source artwork; female
conical hat also lacks a mapped source. Do not manufacture historical approval or silently
classify traditional pants as modern to fill missing presets.

## User review

Judge silhouette and motif preservation first, then neck/shoulder coverage, cuff/hand
continuity, underwear coverage, hems and shoes. Compare switching bottoms/shoes without
changing the top. Reject any mask leaking into another selected garment. Inspect both
phone-size and enlarged images, including light and dark backgrounds.

## Correction — 2026-10-06
The user rejected the 36-combination study: overlay placement is not convincing fitting.
That study is archived as REJECTED_FIT, not an approval queue. Work sequentially, starting
with male A. Preserve the original body and deliver removable garment layers; inspect
shoulders, collar, cuff openings, hands, hem and shoes before multiplying combinations.
The single-A candidate is not yet accepted. Stop and report if account quota approaches
exhaustion; do not claim work continues in the background after a turn ends.
