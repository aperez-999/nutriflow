# NutriFlow design system

## Concept: the training log meets the nutrition label

NutriFlow is used in two moments: a quick check-in before training and a log at the end of the day. The interface takes its cues from the two honest documents of that world, the paper training log and the Nutrition Facts label: black ink on white, heavy rules that separate sections, condensed bold numbers, and no decoration. Color is reserved for the user's own data.

## Tokens (theme: `frontend/src/theme/index.js`)

| Role | Light | Dark | Use |
|---|---|---|---|
| `bg.canvas` | `#F5F5F5` | `#0A0A0A` | page background |
| `bg.surface` | `#FFFFFF` | `#141414` | panels, inputs |
| `bg.muted` | `#EFEFEF` | `#1C1C1C` | hover rows, quiet fills |
| `border` | `#E3E3E3` | `#2A2A2A` | 1px dividers, panel outlines |
| `border.strong` | `#0A0A0A` | `#EDEDED` | label rules (3px), focus |
| `fg` | `#0A0A0A` | `#EDEDED` | text, primary button fill |
| `fg.muted` | `#525252` | `#A3A3A3` | secondary text (≥ 7.2:1 light, ≥ 7.3:1 dark) |
| `fuel` | `#14936F` | `#17977A` | meals, calories, protein |
| `train` | `#E0561F` | `#D9561F` | workouts, effort |
| `recover` | `#3C5FD9` | `#5070E8` | check-ins, sleep, readiness |

Neutrals carry no tint. Flow colors were validated for color-vision deficiency (protan/deutan ΔE ≥ 10) and ≥ 3:1 against the surface in both modes.

**Type:** Archivo for everything. Normal width for UI and prose; condensed (`font-stretch: 75%`), bold, tabular figures for numbers. One family, two widths.

**Shape:** 6px radius on controls, 10px on panels. Panels are separated by 1px borders, not shadows. Only modals and menus float, so only they get a shadow.

## Rules

- Primary actions are ink: black button in light mode, white in dark mode. One primary per view.
- Color means data: fuel, train or recover. Never use it for decoration, headings or chrome.
- No gradients, glows, blurs, glass, or colored shadows.
- No uppercase tracked eyebrows. Section titles are sentence case, bold, and say what the section is.
- No hover lift. Hover changes background or border on interactive elements only.
- No arrows appended to buttons, no middle-dot meta strings, no emoji.
- Motion only in response to an action (save, tab switch, progress filling). 150-250 ms, ease-out. Respect reduced motion.
- Numbers line up: tabular figures, right-aligned in tables, units in muted text.
- Empty states say what to do next in one sentence.

## Review against the generic default

The default for "AI fitness app" is a teal or purple gradient hero, glass cards with icons, stock photos of athletes, uppercase eyebrows and a hover lift on every card. This system replaces each of those: a white page with a real product artifact (the daily label) as the hero, ink buttons, borders instead of shadows, and color appearing only where your data does.
