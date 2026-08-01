# Sonexa Game Studios — rickc2025.github.io

Official website for **Sonexa Game Studios**, served by GitHub Pages at
https://rickc2025.github.io/

## Structure

| Path | What it is |
|---|---|
| `index.html` | Studio site (hero, games, about, contact) |
| `css/style.css`, `js/main.js` | Styling and animations (no build step, no frameworks) |
| `privacy/drumhit/` | DrumHit privacy policy |
| `privacy/tower-to-space/` | Tower To Space privacy policy |
| `privacy/wobbins-hide-and-hue/` | Wobbins: Hide & Hue privacy policy |
| `assets/` | Optimized logos, icons, feature art, screenshots |
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

The older standalone policy pages (`Rickc2025/drumhit-privacy`,
`Rickc2025/tower-to-space-privacy`) are still live and untouched, so any Play Console
links pointing at them keep working. The copies under `/privacy/` here are the same
policies restyled for the site.
