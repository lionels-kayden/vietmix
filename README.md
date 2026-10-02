# Việt phục Remix

2D dress-up web app for Vietnamese students to explore and mix traditional Vietnamese costumes (Việt phục) with modern pieces, featuring cultural story cards and a cultural-fit check.

## Run Commands

### Web Application

- `npm run dev`: Start Next.js development server
- `npm run build`: Build production Next.js bundle
- `npm test`: Run test suite with Vitest
- `npm run check`: Run build and tests together (`npm run build && npm test`)

### Asset Pipeline

- `python pipeline/make_placeholders.py`: Generate placeholder PNG items and base characters
- `python -m pytest pipeline/test_placeholders.py`: Verify asset file counts, 1080x1920 dimensions, and alpha channels
