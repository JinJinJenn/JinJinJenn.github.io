# Editorial studio preview

Isolated redesign prototype on `redesign/moonshot-20261111`. Live root files are unchanged.

Open `/next/index.html` from a static server at the repository root. Pages include home, mods, characters, journal, about, and the six original devlogs.

The mod browser retains all seven projects and their original statuses and detail text. Character turntables retain original game captures. Promotional character illustrations and concepts are not downloadable custom content.

Supplied artwork originals are checkpointed separately under `checkpoint/supplied-art-20261111`; generated presenter originals under `checkpoint/reference-presenters-20261111`. Do not merge those asset-backup branches wholesale.

Preview uses no backend, tracking or external font requests. Theme preference is stored locally. User-facing links to the current site intentionally exit the preview.

QA: PC1 native Chrome checks at 320,390,1366,3840px, light and dark. Search, reset, detail/gallery switching, turntable dialog, artwork dialog, Escape and theme persistence verified. Local asset/link target check covers all 11 pages.
