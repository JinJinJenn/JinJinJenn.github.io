# Preview verification

The current preview is not deployed. The original main and separate mod site remain unchanged.

## Revision 13 baseline: rendering and interaction

An isolated headless Chrome session with a fresh temporary profile checked the local static site. No existing browser session was used.

- 104 browser checks passed, with no uncaught JavaScript errors or failed local requests.
- All ten page types/routes were checked at 320px and 390px, including all six articles.
- Desktop, mobile emulation and 200% text screenshots were inspected. Navigation reflows into two columns with enlarged text, without splitting labels. The local revision label is in normal flow and no longer covers content.
- Theme choice persists between routes. The captured-Sim dialog opens, changes character with arrow keys, pauses to a genuine still, closes with the real button or Escape, and restores focus.
- Reduced motion uses static captures and disables decorative movement. The canopy moves only farther outward from its resting crop.
- The plumbob drew 33 frames during a visible 1.1-second sample, none while offscreen, 33 after returning, and none while paused.
- Actual DPR1 mobile image requests selected responsive derivatives: the small Love Notes envelope transferred approximately 31KB rather than 261KB, and Surprise Gifts approximately 72KB rather than 240KB. These are local resource measurements, not a claim about cellular speed.

## Preservation and implementation

Source checks cover original page URLs, six posts, seven mod entries, real screenshots, three character turntables, root anchors, local resources and the unchanged original repositories. Shared-template, art-direction, gallery, theme/motion, parallax and plumbob tests pass. Full-resolution generated artwork is preserved separately; delivery derivatives do not replace originals.

## Remaining review

Headless mobile emulation does not measure a physical phone's GPU, battery use or touch feel. Safari and Firefox have not been tested. The owner approved publication, and revision 22 went live on 10 November 2026. The checks below describe their individual checkpoints; physical-device and other-browser coverage is still limited.


## Revision 21: interior reading and artwork delivery

- The About page introduces Jenn before the two portraits on narrow screens, while preserving the side-by-side art and reading columns on desktop. The visible artwork caption now identifies it as generated.
- Existing illustrated devlog cards use 480px and 800px delivery copies, with unchanged full-size fallbacks and article covers. At both 390px and 1440px, isolated Chrome selected 480px copies at DPR1 and 800px copies at DPR2. The six cover files totaled 387,080 and 888,370 bytes respectively, versus 2,009,152 bytes for the full-size set. These are local encoded-resource measurements, not a cellular-speed claim.
- About was checked at 320px, 390px, desktop, 200% text and dark theme. Both portraits remained visible; no overlap, horizontal overflow, missing images or JavaScript errors were found. Keyboard skip-to-content continued to work.
- The computer-post excerpt now names the gaming-skill and hacking-money upgrades, rather than implying all hidden stats change.
- Original article artwork, gameplay captures and turntables remain byte-for-byte unchanged. The complete builder reproduced the checkpoint without drift. Physical-device and Safari/Firefox limitations above still apply.


## Revision 22: article reading and mobile cover delivery

- All six posts now put their existing first paragraph before the cover, without adding or removing any prose or artwork. On the 320px robot-post check, useful text begins near 601px instead of 840px.
- Article covers reuse the 480px and 800px delivery files. Their original 1280px files remain the fallback and social-preview image. On the robot post, 390px DPR1 selected 46,846 bytes, 390px DPR2 and desktop DPR1 selected 108,698 bytes, and desktop DPR2 retained the original 236,684-byte cover.
- Eighteen page/viewport/mode cases passed with no JavaScript errors or overflow. This included all six posts at 320/390px and representative desktop, 200% text, dark and reduced-motion checks. Real screenshot zoom, Escape and focus return still worked.
- Existing manual pause persisted across all six articles. The home plumbob stopped drawing offscreen and while paused, then resumed after returning to view. This is an isolated-browser observation, not a physical GPU or battery benchmark.
- Source checks verified unchanged prose, captions, full-cover fallbacks, actual game images and all original routes. Physical-device and other-browser testing remain outstanding.


## Revision 23: visitor copy and mod gallery

- The home page and About lead with mod ideas and player benefits. Availability remains explicit; dated test results, limitations and genuine captures remain in the devlogs. Social descriptions and article introductions were rewritten without adding release promises or new claims.
- Seven existing mods have an image-led gallery, using generated promotional thumbnails totaling 184,944 bytes. The original details and gameplay captures remain reachable through native fragment links and the Details view. Without JavaScript, both views remain available.
- Thirteen isolated Chrome cases passed: gallery at desktop, 320/390px, dark theme, 200% text, reduced motion and no-JavaScript, plus desktop/mobile Home, About and a representative article. No horizontal overflow, missing gallery images or JavaScript errors were found.
- Gallery selection, direct-link reloads, Back navigation, view toggles, keyboard focus transfer and original screenshot zoom/Escape/focus return passed. A native-fragment focus reset found during testing was fixed and rechecked.
- Existing shared layout, all seven detail articles, six post routes, genuine screenshots and three turntables are preserved. This remains emulated-device Chrome coverage, not physical-phone, Safari or Firefox testing.

## Revision 24: full-size mod artwork browsing

- Each of the seven gallery cards now has an Explore artwork action, separate from its existing detail link. The viewer includes previous/next buttons, arrow-key navigation, a full-size image link, and clear generated-art attribution.
- Node syntax validation and jsdom behavior checks passed for all seven source paths, next/previous wrap, keyboard arrows, close/focus return, reopening at a selected item, pagehide cleanup, and preserved detail anchors. Images are requested only when viewed; no artwork or original routes were removed.
- Browser visual checks were attempted but could not run: this executor's Chromium cannot create its process singleton socket (`Operation not permitted`), including the permitted escalated attempt. Native dialog focus trapping, Escape/backdrop close, mobile layout, and physical-device behavior remain unverified for this revision.
