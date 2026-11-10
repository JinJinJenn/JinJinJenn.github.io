# Preview 13 verification

The current preview is not deployed. The original main and separate mod site remain unchanged.

## Rendering and interaction

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
