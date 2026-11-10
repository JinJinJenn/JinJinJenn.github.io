# Main site garden preview

This source is developed on `preview/main-garden` in the main profile repository.
Revision 22 was published to the main site on 10 November 2026. Later changes are
checked on the branch before promotion. The separate `/mods/` repository remains unchanged.

## View locally

From this folder, run:

```
python -m http.server 8767 --bind 127.0.0.1
```

Open http://127.0.0.1:8767/ on the same computer. This does not publish the site.
The static pages also work when `index.html` is opened directly, but a local
server is recommended for checking every route and the custom 404 page.

## Preserved

- Original About content, six devlog articles, URLs and sitemap. Article copy has been revised where it was clipped or sent readers elsewhere for images; substantive meaning and historical test results remain.
- Root anchors `#mods`, `#characters`, `#gamedev` and `#web`.
- Seven mod entries and original screenshots.
- Three original five-frame in-game character turntables and PNG stills.
- The original garden link, Jerry and Ruby.
- About's privacy statement. No analytics or external fonts were added.

## New artwork and motion

All six articles have distinct generated editorial illustrations. Every mod has
a generated transparent promotional layer, alongside its genuine game capture.
Artwork provenance and derivative checksums are in `assets/art-provenance.json`.
Original full-resolution PNGs are backed up separately; these are WebP delivery
derivatives. Generated art is labeled and is never presented as gameplay proof.

Motion is bounded, responds only while a section is visible, and has a Pause
motion button. Reduced-motion preferences use static captured Sims and disable
decorative parallax. `?motion=off&gpu=0` is a static fallback review route.

## Review before merging

Preservation, local-resource, HTTP-route and JavaScript syntax checks pass.
Isolated headless Chrome checks and screenshot review passed for desktop, 320/390px mobile emulation, 200% text, gallery controls, theme persistence, reduced motion and offscreen animation suspension. Physical phone/GPU testing and Safari/Firefox review remain pending. See QA.md for coverage and limits.

No hosting migration is required. Once reviewed, merge this branch into main
through the existing GitHub Pages workflow. Until then, do not change the Pages
source or deploy this branch. The recovery branch
`backup/main-before-garden-2026-11-09` retains the original main snapshot.
