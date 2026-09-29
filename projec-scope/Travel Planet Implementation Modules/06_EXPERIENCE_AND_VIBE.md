# EXPERIENCE + VIBE

## VIBE responsibility

VIBE is the visual experience/composition runtime.

It should manage:

- pages
- templates
- reusable components
- headers
- footers
- navigation
- branding
- media
- SEO
- forms
- custom fields
- publishing
- responsive behavior
- localized variants
- analytics hooks
- AI-assisted content

## Experience graph

`Traveler ↔ Destination ↔ Place ↔ Experience ↔ Circle ↔ Discussion ↔ Group Trip ↔ Journey ↔ Booking ↔ Document ↔ Story`

## UX laws

- Purpose before decoration.
- Consistent design system.
- Progressive disclosure.
- Operational density for admin surfaces.
- Task-first for operators.
- Discovery-first for travelers.
- Mobile bottom navigation for customers/operators where appropriate.
- Accessibility is a requirement, not polish.
- Every action needs state, feedback and error handling.

## VIBE compiler concept

`Request → Intent → Schema → Component IR → Runtime renderer`

Pages should be structures with localizations and configuration, not duplicated implementations per language or tenant.
