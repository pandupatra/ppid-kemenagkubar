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
