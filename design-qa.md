# Profil PPID visual QA

- Source visual truth: `C:\Users\pandu\AppData\Local\Temp\codex-clipboard-LznnZn.png` (supplied reference, 1046 x 792 px).
- Implementation captures: `output/design-qa/profil-desktop.jpg` (1513 x 725 px) and `output/design-qa/profil-mobile-360.jpg` (345 x 767 px).
- Route and state: `/profil/`, default active tab, desktop first viewport and a 360 px responsive viewport.

## Evidence and review

The browser-rendered desktop capture was compared with the supplied reference.
The implementation preserves the dominant dark-green two-column hero, gold
eyebrow/rule and download action, tab rail, leadership split, three-column
implementer list, and pale-green responsibility band. The persistent public
header is intentionally retained because it is a required portal shell.

- Fonts and typography: the existing system sans-serif uses a heavy display
  weight for the title and a compact uppercase treatment for labels, preserving
  the reference hierarchy and readable wrapping.
- Spacing and layout rhythm: the hero and content align to the portal-wide
  container; the desktop split stays balanced and collapses to one column on
  mobile.
- Colors and tokens: the existing institutional green, deep-green text, and
  restrained gold accent match the reference direction and remain high contrast.
- Image and icon fidelity: the project-owned official crest remains unchanged;
  the download action uses the installed Lucide icon family already used by the
  portal. No substitute logo or placeholder imagery was introduced.
- Copy and content: the route uses the supplied profile, decree, structure, and
  responsibility copy. Its SK action currently scrolls to the structure because
  no approved document URL is available in the repository.

## Interaction and responsive checks

- The three tab links use in-page anchors.
- Desktop browser console: no errors.
- At 360 px, `documentWidth` was 345 px against a 360 px viewport: no horizontal
  overflow. Hero, decision panel, leadership, implementers, and duties stack in
  reading order.

## Findings

No actionable P0, P1, or P2 visual mismatches were found for this scoped,
reference-led implementation. The omitted geometric hero watermark is accepted
as a P3 difference because the portal has no approved asset for it and the
information hierarchy is preserved.

## Final result

final result: passed

---

# Accessibility ribbon visual QA

- Source visual truth: `C:\Users\pandu\AppData\Local\Temp\codex-clipboard-sa2y6h.png`
  (48 x 200 px supplied reference; visible blue tab approximately 43 x 174 px).
- Focused implementation capture:
  `.playwright-cli/element-2026-09-15T00-50-02-822Z.png` (44 x 172 px).
- Full-view implementation capture:
  `.playwright-cli/page-2026-09-15T00-51-05-536Z.png` (1280 x 720 px).
- Route and state: `/`, accessibility drawer closed, light theme, desktop
  viewport at device scale factor 1.

## Evidence and review

The supplied source and focused implementation capture were opened together
and compared at native pixel density. The implementation matches the reference
with a narrow vertical blue tab, flat left attachment, fully rounded exposed
right corners, a white accessibility icon, and bold vertical uppercase label.

- Fonts and typography: existing system sans-serif, bold uppercase treatment,
  compact line height, and vertical orientation match the reference hierarchy.
- Spacing and layout rhythm: rendered 44 x 172 px size closely matches the
  approximately 43 x 174 px visible source tab; icon, label, and internal gap
  are centered along one vertical axis.
- Colors and visual tokens: fixed reference blue `#478fdf` and white foreground
  remain stable across portal themes; hover uses a darker blue and keyboard
  focus remains visibly outlined.
- Image and icon fidelity: no raster asset is required; the control uses the
  project's installed Lucide accessibility icon rather than a text glyph.
- Copy and content: `AKSESIBILITAS` matches the supplied label, and the existing
  accessible name remains `Buka pengaturan aksesibilitas`.

## Interaction and responsive checks

- The tab remains a functional trigger for the existing left-side sheet.
- Its 44 px width preserves a minimum touch target without changing the source
  proportions.
- Browser console contained only the React development-tools informational
  message and no application errors.

## Findings

No actionable P0, P1, or P2 mismatches remain. The Lucide icon has a slightly
different stroke construction from the source wheelchair mark; this is accepted
as P3 because it preserves the established icon system and accessible meaning.

## Comparison history

- Initial capture was 44 x 138 px and inherited the portal green due to utility
  precedence.
- The trigger color was pinned to the supplied blue and its minimum height was
  raised above the shared button utility.
- Post-fix capture measures 44 x 172 px and matches the reference silhouette.

## Final result

final result: passed
