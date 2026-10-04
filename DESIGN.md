---
# gstack: design-md-format=spec
name: Carepatron Templates (ChatGPT plugin)
description: Carepatron's editorial marketing voice shrunk to a chat card — warm cream, ink type, one deep purple pill.
colors:
  primary: "#5B1DB1"
  primary-hover: "#4A1693"
  on-primary: "#FFFFFF"
  surface: "#FAFAF3"
  text: "#0D073B"
  text-muted: "#0D073BA6"
  hairline: "#EBE6FA"
  brand-mark: "#7242EE"
  dark-primary: "#7242EE"
  dark-primary-hover: "#8659F2"
  dark-surface: "#120C33"
  dark-text: "#F4F1FF"
  dark-text-muted: "#B9B2D6"
  dark-hairline: "#2A2350"
typography:
  display:
    fontFamily: Source Serif 4
    fontWeight: 400
    fontSize: 25px
    lineHeight: 1.15
    letterSpacing: -0.01em
  body:
    fontFamily: Instrument Sans
    fontSize: 14px
    lineHeight: 1.5
  label:
    fontFamily: Instrument Sans
    fontSize: 12.5px
    fontWeight: 600
  mono:
    fontFamily: Instrument Sans
    fontSize: 12px
    fontFeature: tnum
rounded:
  card: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 22px
components:
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.card}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  link-secondary:
    textColor: "{colors.text}"
    underlineColor: "{colors.hairline}"
---

# Carepatron Templates (ChatGPT plugin)

## Overview

**Creative North Star:** a piece of carepatron.com that arrives inside ChatGPT. Built from Carepatron's own site (Copernicus serif display, Helvetica Now body, cream ground, deep purple pills), substituted with free faces because the card can't ship licensed fonts.
**Product context:** one embedded card (`web/card.html`) rendered by `templates.get` inside ChatGPT, seen by clinicians mid-task and, for the pitch, by Carepatron's team. About 640px wide, max two actions.
**Mode per surface:** card = Persuade + Operate (scan the sections, click Open in Carepatron).
**Reference sites:** https://www.carepatron.com/ , https://www.carepatron.com/templates/soap-progress-notes-template/ (measured 2026-10-04).
**Key characteristics:** serif title that reads as Carepatron at a glance; sections as a mini blank form; one purple pill; nothing decorative.

## Colors

**Strategy:** Committed to Carepatron purple; everything else neutral derived from their ink navy and lavender.
**Light or dark:** follows the host. Light uses the brand cream (deliberate departure from ChatGPT white). Dark uses deep ink from Carepatron's "alternate" background, not an inverted cream, and swaps the CTA to the lighter logo purple for contrast.
Purple appears only on the primary button and the logo mark, so the eye lands on the click.

## Typography

Source Serif 4 (display, 400) stands in for Copernicus; Instrument Sans stands in for Helvetica Now Display. Both are OFL on Google Fonts, loaded from fonts.googleapis.com / fonts.gstatic.com (declared in the resource CSP). Fallbacks: Georgia, then Helvetica/Arial. Section numbers use tabular figures, two-digit (`01`–`08`).

## Layout

Single column, left-aligned: brand row → title → purpose → meta line (profession bold · type · N sections) → sections in two columns of numbered rows with top hairlines → action row. Card padding 20px top / 22px sides. Two columns hold up to 8 sections without scrolling; below 420px width, sections drop to one column.

## Elevation & Depth

None. A 1px hairline border separates the card from the chat. No shadows, no glow.

## Shapes

Card 16px radius; primary button full pill; nothing else is rounded.

## Components

- **Primary button:** "Open in Carepatron →", pill, 600 weight. Hover darkens (120ms). Focus-visible: 2px outline in text color, 2px offset.
- **Secondary link:** "View template page", text with a hairline underline; underline goes to text color on hover.
- **States:** loading shows a muted "Loading template…" line; if a URL fails the allowlist, its action is hidden; very long titles wrap (no truncation).

## Do's and Don'ts

- Do: keep purple for the primary action and logo only.
- Do: show the profession in the meta line in bold, everything else muted.
- Do: keep the card height fitting its content (report content height, not document height).
- Don't: add chips, icons in circles, shadows, gradients, or a kicker label.
- Don't: add a third action or a second pill.

## Motion

- **Approach:** minimal-functional
- **Easing:** enter(ease-out)
- **Duration:** card fade-in 180ms; button hover 120ms
- **The one authored moment:** the card fading in when the template arrives.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-04 | Initial design system created (variant A, brand-native) | /design-consultation; measured carepatron.com; user picked A over host-native and ink-header variants |
| 2026-10-04 | Tried and reverted: search results rendering the card plus a closing in-reply link | User found two CTAs confusing and invasive; card stays on templates.get only |
