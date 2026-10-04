PHASE: 2 Core Dress-Up (Scoped Fixes T6–T7)
STATUS: PASS
TASKS:
- T1 Dress-up design foundation: ok, vitest run app/page.test.tsx app/dress-up/page.test.tsx, passed (5 tests)
- T2 Character and outfit state: ok, vitest run lib/outfit.test.ts, passed (6 tests)
- T3 Layered renderer and fit adapter: ok, vitest run lib/fit.test.ts app/components/CharacterCanvas.test.tsx, passed (11 tests)
- T4 Wardrobe interaction: ok, vitest run app/components/Wardrobe.test.tsx app/dress-up/page.test.tsx, passed (7 tests)
- T5 Presets and dress-up integration: ok, vitest run lib/presets.test.ts app/components/PresetsSelector.test.tsx app/dress-up/page.test.tsx, passed (13 tests)
- T6 Fix failed garment rendering: ok, vitest run app/components/CharacterCanvas.test.tsx, passed (7 tests)
- T7 Add the required gentle garment entry motion: ok, vitest run app/components/CharacterCanvas.test.tsx, passed (9 tests)

FILES CHANGED (T6–T7 Scoped Diff):
- [app/components/CharacterCanvas.tsx](file:///e:/1.%20vietmix/app/components/CharacterCanvas.tsx)
- [app/components/CharacterCanvas.test.tsx](file:///e:/1.%20vietmix/app/components/CharacterCanvas.test.tsx)
- [app/globals.css](file:///e:/1.%20vietmix/app/globals.css)

HOW TO RUN:
```bash
npm run dev       # Starts dev server (runs predev asset sync)
npm run check     # Runs Next.js build + full Vitest test suite (103 tests passing across 15 files)
npm test          # Runs all 15 test files with Vitest
```

HOW TO TEST BY HAND:
1. Run `npm run dev` and navigate to `http://localhost:3000/dress-up`. Select character "Nam".
2. Select preset "RX-01 - Ngũ thân hiện đại". Verify that 3 garments (Áo ngũ thân, beige trousers, sneakers) animate in gently using `.garment-enter`.
3. In the Wardrobe component, switch to the "Phụ kiện" tab and equip "Nón lá" (head accessory).
4. Simulate a head-image load failure (in the browser developer console: `document.querySelector('img[alt="Nón lá"]')?.dispatchEvent(new Event('error'))`). Verify that the head fallback appears as a compact, bounded indicator badge at top ~6% (`[Lỗi ảnh: Nón lá]`), leaving the character body, Áo ngũ thân (top), Quần lụa/beige (bottom), and Giày (shoes) completely unobstructed and visible.
5. In the Wardrobe, replace "Áo ngũ thân" with "Áo giao lĩnh". Confirm that only the newly equipped top executes the entry animation, while existing shoes and trousers do not replay.
6. In browser settings or DevTools, emulate `prefers-reduced-motion: reduce`. Equip and remove items to confirm that animation durations are suppressed immediately with zero motion.

VISUAL CHECKS NOT PERFORMED:
- Automated browser rendering and screenshot capture at desktop (1200x800) and phone (390x844) viewport widths could not be executed via the automated browser agent because the Playwright driver binary download failed with a 404 from the upstream CDN on Windows.
- Human-eye visual validation on physical touch devices (e.g. mobile Safari / Chrome) was not performed.
- JSDOM tests verify DOM structure, inline styles, classes, slot positioning, and z-index ordering, but JSDOM does not calculate layout geometry or render pixels. Real garment contouring and anatomical alignment remain deferred to P3a.

KNOWN ISSUES:
- None in code, types, build, or tests (103 tests pass; production build succeeds). Placeholder garments remain synthetic test rectangles until photographic assets are calibrated in P3a.

LAST COMMIT:
`a041156 p2-t7: add reduced-motion-aware garment entry`