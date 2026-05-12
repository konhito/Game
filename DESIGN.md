# DESIGN

## Color Strategy
- Use **emerald** as primary trust signal and “earn” accent.
- Use **sky/blue** as secondary accent for contrast, links, and informational highlights.
- Keep backgrounds light and airy with subtle gradients. Dark mode should remain readable, not neon.

## Tokens (Tailwind + CSS Variables)
This project uses shadcn-style CSS variables in `app/globals.css`.

- `--primary`: emerald
- `--accent`: blue
- `--background`: white
- `--muted`: slate-ish neutral

## Hero Direction
- Aurora-style soft blobs behind content for depth.
- Headline uses gradient text, but keep body copy neutral for legibility.
- CTAs: one strong primary, one quiet secondary.
- Add a “proof” row (rating/users) and a compact feature list.

## Typography
- Headline: bold, tight tracking, large sizes
- Body: muted foreground, relaxed leading
- Avoid long paragraphs, keep scanning easy

## Motion
- Use framer-motion for entrance and subtle hover lifts.
- Avoid continuous, high-frequency motion in the content layer (background can animate).

