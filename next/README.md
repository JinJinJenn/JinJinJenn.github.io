# Jenn’s studio preview

The redesigned site is published at `/next/` from this repository’s main branch. It is still a preview, not a replacement for the root site. The separate `/mods/` garden and `/town/` game are separate projects and must not be overwritten by a profile-site release.

Serve the repository root with a static HTTP server and open `/next/index.html`. The preview has Home, Mods, Characters, Devlog, About Jenn and six original devlog articles. Keep the original article content, seven mod projects and their documented statuses. Generated character studies and story illustrations are labelled separately from actual game captures; they are not advertised as downloadable custom content.

## Before a release

Run the dependency-free, read-only source audit from any directory with Python 3.9 or newer:

```sh
python next/checks/release_audit.py
python next/checks/test_release_audit.py
```

Or pass `--root /path/to/checkout`. It exits nonzero for detected failures and checks:

- Local HTML links, asset references, `srcset` targets and fragment destinations.
- Duplicate IDs, image alt-attribute presence and preview `noindex` metadata.
- Links to the six original journal stories and the seven documented mod statuses.
- SHA-256 integrity of thirteen original game-capture files, recorded in `checks/original-captures.json`.

The capture manifest is a preservation baseline, not a security signature. If an original capture intentionally changes, review its provenance and update the manifest explicitly. Do not regenerate it just to silence a failure. Status changes likewise need actual project evidence, not a test-driven copy change.

These checks do **not** validate visual quality, alt-text accuracy, external URLs, CSS/JavaScript-created references, browser behavior, performance, current game compatibility or accessibility compliance. A passing source audit is only one release gate.

Use PC1 browser QA for mobile, tablet and 4K, light/dark themes and enlarged text. Check art framing, legibility, touch targets, keyboard/focus/history, catalogue search/filter recovery, real turntables, concept and evidence viewers, and reduced-motion/pause behavior. Simulated network/script failures should remain usable. Verify deployed content and capture fresh public screenshots; do not call candidate screenshots live or a queued build successful.

## Preservation and promotion

Work from current main, checkpoint changes to GitHub, then review the exact diff before deployment. Old backup branches and recovery archives contain earlier versions of the preview: never merge them wholesale over later work. Supplied-art originals are separately checkpointed under `checkpoint/supplied-art-20261111`; generated presenter originals under `checkpoint/reference-presenters-20261111`.

Town recovery is not part of the current preview. Its image-upload approval state and version-specific capture provenance must be resolved through the existing workflow before its candidate is resumed. Port only its own new files and surgically reconcile navigation against current pages. Do not restore archived copies of the eleven existing pages.

Root promotion is a separate coordinated step. Preserve or explicitly map `/about.html`, `/devlog/`, all six historical article URLs and root project/section fragments, including `#gamedev` and `#web`. Keep the separate game and mod-garden destinations intact. Reconcile outdated root copy against confirmed current work. Only then review `noindex`, canonical URLs and the sitemap for the chosen public routes.

The preview uses no backend, analytics or external fonts. Theme and explicit motion preferences are stored locally; storage denial is handled gracefully. OS reduced motion takes priority without rewriting the saved choice. Links labelled Current site intentionally exit the preview.
