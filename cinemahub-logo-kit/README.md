# CinemaHub Logo Kit — "Filmstrip Play"

A play button framed by film sprockets. Red #E50914 on #1C1C1E, wordmark in Sora 700 lowercase.

## Files
- `logo-icon.svg` — rounded-corner mark, use in navbar / login / anywhere on the web
- `logo-icon-square.svg` — full-bleed square source (for generating more icon sizes)
- `icons/icon-{72..512}x{...}.png` — PWA icons; paths match your existing `manifest.json` (`/icons/icon-NxN.png`), content is inset for maskable safe zone
- `favicon-32x32.png`
- `logo-lockup-on-dark.png` / `logo-lockup-on-light.png` — full lockup, transparent background (for marketing, readme, social)
- `logo-usage.html` — copy-paste markup for the navbar/login lockup

## Drop into your repo
1. Copy `icons/` to the repo root so they serve at `/icons/…` — manifest.json already points there.
2. Copy `logo-icon.svg` + `favicon-32x32.png` to the root.
3. Use the snippet in `logo-usage.html` for the navbar and login page (needs the Sora Google Font link).

## Colors & type
- Red: `#E50914` · Tile: `#1C1C1E` · Sprockets: `rgba(255,255,255,0.28)`
- Wordmark: Sora 700, lowercase, letter-spacing -0.02em, red period.
