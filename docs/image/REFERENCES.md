# References reviewed 2026-10-05

- https://github.com/KhurrumAli1997/paper-doll-studio — closest workflow reference:
  illustrated paper dolls, separate clothing slots and RGBA export. Its README includes
  local model-based generation; we do not install or copy that stack. User artwork and
  deterministic image processing remain the basis of this project.
- https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator —
  reference for modular layers and variants. Its pixel-art aesthetic is not adopted.
  No external source code or art is copied, so no third-party asset enters our catalog.

Our visual direction: preserve the supplied base identity, garment outlines and patterns;
consistent scale, clean edges and readable silhouettes. References are technical/art
workflow inspiration, not verification of Vietnamese cultural accuracy.

P3a tasks executed in sequence:
T1 canonical legacy IDs + explicit source map + color-free catalog; check npm run check
and pipeline tests, then commit.
T2 deterministic border-connected removal + component extraction, normalize base canvas;
synthetic tests preserve enclosed white areas and input files.
T3 parse canonical kind/variant and scan dominant pixel colors; write draft manifest.
T4 generate anchor-based uniform-fit previews, numeric PASS/WARN/FAIL diagnostics and
learn_defaults without overwriting user values; visual checklist and report. Draft
outputs stay outside runtime assets until visually approved. No /fit UI in P3a.
