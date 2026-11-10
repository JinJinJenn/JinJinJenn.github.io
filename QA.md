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

Headless mobile emulation does not measure a physical phone's GPU, battery use or touch feel. Safari and Firefox have not been tested. The owner should review the visual direction and interactions before replacing the main site. No merge or public deployment is included in this checkpoint.


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
