# Sonexa Game Studios — rickc2025.github.io

Official website for **Sonexa Game Studios**, served by GitHub Pages at
https://sonexagamestudios.com/

## Structure

| Path | What it is |
|---|---|
| `index.html` | Studio site (hero, games, studio, contact) |
| `css/style.css` | All styling and animations (no build step, no frameworks) |
| `js/main.js` | Nav, scroll reveals, screenshot lightbox, trailer, hero particles |
| `js/i18n.js` | Language switching |
| `i18n/*.json` | One file per language |
| `privacy/drumhit/` | DrumHit privacy policy |
| `privacy/tower-to-space/` | Tower To Space privacy policy |
| `privacy/wobbins-hide-and-hue/` | Wobbins: Hide & Hue privacy policy |
| `assets/` | Optimised logos, icons, feature art, screenshots, trailer posters |
| `app-ads.txt` | AdMob verification — **do not remove** |
| `404.html` | Branded not-found page |

## Games on the site

Listed in the order they appear on the page.

| Game | Package | Play Store |
|---|---|---|
| Wobbins: Hide & Hue | `com.sonexastudios.hidehue` | Not live yet — non-clickable "Coming soon" chip (`<span class="badge-soon">`) carrying the future listing URL in `data-play-url`. No other call to action. |
| DrumHit | `com.sonexastudios.drumhit` | **Live** — badge links to the listing |
| Tower To Space | `com.sonexastudios.towertospace` | Not live yet — same chip as Wobbins |

When Tower To Space or Wobbins goes live on Google Play, replace its
`<span class="badge-soon" data-play-url="...">` in `index.html` with the
`play-badge` anchor pattern used by DrumHit, using the URL already stored in
`data-play-url`. (The chips are deliberately not links today — the listings
don't exist yet, and clicking through to a Google Play 404 looks broken.)

## Languages

English lives directly in `index.html`; every other language is a JSON file in
`i18n/`, fetched only when someone picks it, so a default visit downloads no
translation data at all.

**To change English copy**, edit `index.html` — then regenerate the translation
source so it cannot drift:

```bash
python tools/extract-strings.py
```

That rewrites `i18n/en.json` from the page. Any key you add needs a matching
`data-i18n="some.key"` attribute in the HTML, and the same key adding to each
`i18n/<code>.json`. A key missing from a translation falls back to English
rather than rendering blank.

Language is chosen in this order: `?lang=` in the URL, then the visitor's saved
choice, then their browser language, then English.

## Trailer

The DrumHit card shows a poster image, not a YouTube player. The player is only
created when someone clicks it, so YouTube loads nothing and sets no cookies
otherwise. Desktop gets the landscape cut, phones get the vertical one — the two
video IDs live in `data-video-wide` / `data-video-tall` on `#drumhitVideo`.

## Notes

The older standalone policy pages (`Rickc2025/drumhit-privacy`,
`Rickc2025/tower-to-space-privacy`) are still live and untouched, so any Play Console
links pointing at them keep working. The copies under `/privacy/` here are the same
policies restyled for the site. The privacy pages are intentionally English-only —
they are the legal text submitted to Google Play.
