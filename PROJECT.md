# PROJECT.md: Viet phuc Remix (read this first in every phase)

## GOAL
2D dress-up web app for Vietnamese students to explore and mix traditional Vietnamese
costumes (Viet phuc) with modern pieces, with cultural story cards and a cultural-fit
check. UI text: Vietnamese. Code, file names, commits: English. Audience: students and
an audition jury scoring creativity and cultural depth.

## WORKING RULES (every phase)
- Each phase prompt lists numbered tasks (T1, T2, ...). Do them strictly in order,
  one at a time.
- For each task: implement it, then run THAT task's check. If it passes, commit
  "p<phase>-t<n>: <task name>" and go to the next task. If it fails, fix and re-run
  (up to 3 attempts). If it still fails, STOP and print a FAILURE REPORT. Never skip a
  task, never weaken or delete a test to make it pass.
- Do not build anything outside the current phase's task list. Do not refactor earlier
  phases unless a task says so.
- When all tasks pass, run build + tests once more, then STOP and print the PHASE
  REPORT. Do not start the next phase.
- Never invent historical facts; anything unverified gets needs_review=true.
- Terminal work; short status lines; no long explanations.
- Do not add dependencies without need.

## PHASE REPORT FORMAT (print exactly)
PHASE: <n> <name>
STATUS: PASS | PARTIAL | FAIL
TASKS: one line per task: Tn <name>: ok/fail, check run, result
FILES CHANGED: <list>
HOW TO RUN: <commands>
HOW TO TEST BY HAND: <3 to 6 steps>
KNOWN ISSUES: <list or "none">
LAST COMMIT: <hash + message>

## FAILURE REPORT FORMAT (when stopping mid-phase)
PHASE/TASK: <n / Tn>
CHECK THAT FAILED: <command>
FULL OUTPUT: <error text, trimmed to the relevant part>
WHAT WAS TRIED: <list>

## STACK AND ENVIRONMENT
- Next.js (App Router) + TypeScript + Tailwind, deployed to Vercel.
- No database, no runtime AI calls. All story text is pre-written static JSON.
- Image pipeline in Python (Pillow, numpy, scipy; rembg optional).
- The user is on Windows: use cross-platform commands.
- Vercel filesystem is read-only at runtime: production routes never write files.
  The lookbook uses localStorage.

## FOLDERS
- assets/male, assets/female: PNG items and base characters (transparent)
- assets/scenes: SVG backgrounds
- data/: items.json, stories.json, rules.json, scenes.json, anchors.json, fit.json,
  fit_defaults.json, manifest.json
- pipeline/: Python scripts
- reports/: fit reports and preview images
- app/: Next.js app

## CHARACTERS AND LAYERS
- Two base characters (male, female), one fixed pose each, shared canvas 1080x1920,
  transparent PNG. Base files: male_base.png, female_base.png.
- Layer order, bottom to top: body, shoes, bottom (trousers or skirt), top, neck
  accessory, head accessory. Wide trousers cover the shoes.
- Each slot holds one item. The head slot holds the conical hat OR the hairpin.
- Original garment colors are fixed (no recolor feature).
- Images may be missing: the app shows a grey labeled placeholder (phase 0 creates
  placeholder PNGs so everything can be tested).

## ITEM CATALOG (file name pattern {M|F}_{set}_{SLOT}_{name}.png)
Sets: A = ao ngu than (Nguyen, daily wear); B = ao giao linh (Le-Trinh, modern
reconstruction); C = Nguyen ceremonial (male: ao tac, female: ao nhat binh);
MIX = modern pieces.

Male items (9):
- Tops: A ao ngu than (indigo); B ao giao linh (earth brown); C ao tac (blue brocade
  with gold flower-and-cloud motifs)
- Bottoms: white silk trousers (shared by A, B, C); beige modern wide-leg trousers (MIX)
- Shoes: black cloth shoes with white soles (traditional); white sneakers (modern)
- Accessories: conical hat (non la); silver chain necklace

Female items (11):
- Tops: A ao ngu than (jade green); B ao giao linh (indigo); C ao nhat binh (crimson,
  gold border)
- Bottoms: white silk trousers (A, C); long black skirt (B); beige modern wide-leg
  trousers (MIX)
- Shoes: black cloth shoes with white soles (traditional); white sneakers (modern)
- Accessories: conical hat (non la); silver chain necklace; silver hairpin (female only)

Modern items: beige trousers and sneakers. All other items are traditional.
Placeholder count for phase 0: 9 male + 11 female + 2 base characters = 22 files.

Presets: Set A, Set B, Set C per gender; Remix RX-01 (ngu than + beige trousers +
sneakers); RX-02 (giao linh + beige trousers + sneakers + necklace). Set C has no
Remix preset.

## SCENES
tet, ky-yeu, le-hoi, doi-thuong (simple flat SVG backgrounds behind the character).
Remix cap = maximum number of modern items allowed: le-hoi 1, tet 1, ky-yeu 2,
doi-thuong 2. A scene suggests sets but never forces one.

## APP OVERVIEW (context only; build only what the current phase asks)
1. Choose character (male or female).
2. Choose scene (background).
3. Dress-up: layered character, tabs (Top, Bottom, Shoes, Accessories), preset buttons,
   a Classic-Remix slider, a story card for each item added, button "Chot bo".
4. Result: cultural-fit rules run on the WHOLE outfit (block, warn, suggest), summary
   card assembled from pre-written fragments, item flip cards, buttons Share and
   Download image.
5. Lookbook: saved outfits in localStorage, export image.
Hidden route /fit (internal tool to align garments): exists only when ENABLE_FIT=1,
returns 404 otherwise, never linked from the UI.

## DEFINITION OF DONE (every phase)
- npm run build passes; npm test passes; no console errors.
- The phase checklist from the prompt is satisfied.
- Everything is committed, then STOP and print the PHASE REPORT.

## DESIGN DIRECTION
- Mood: warm and classic, with a fresh Gen Z feel. Colors: do-paper cream background,
  lacquer-red and indigo accents, small touches of gold, and ink-colored text. Draw
  restrained inspiration from Dong Ho prints and do paper in backgrounds, borders,
  and icons; keep the interface uncluttered.
- Prioritize phones and one-handed use: rounded cards, subtle shadows, and large tap
  targets. The character must always remain the visual focus.
- Typography: a Vietnamese-capable serif font for headings and a clean sans-serif
  font for body text, loaded through next/font. Verify Vietnamese diacritics render
  correctly.
- Use gentle motion for card flips, sliders, and items sliding into place. Respect
  the user's reduced-motion preference.
- Vietnamese copy must be friendly and polite. Do not state unverified claims as facts.
- Keep each step simple: show only the controls relevant to that step.
