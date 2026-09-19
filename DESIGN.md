---
name: Ramshankar Bhuvaneswaran Portfolio
description: A monochrome technical broadsheet for ML systems evidence.
colors:
  bone: "#FAF9F6"
  bone-secondary: "#F2F1EA"
  bone-card: "#FFFFFF"
  obsidian: "#080808"
  obsidian-secondary: "#101010"
  obsidian-card: "#151515"
  ink: "#111111"
  ink-muted: "#666666"
  chalk: "#F5F5F7"
  chalk-muted: "#A1A1AA"
  rule-light: "#E2E1DA"
  rule-dark: "#222222"
  accent-light: "#000000"
  accent-dark: "#FFFFFF"
  status-live-light: "#15803D"
  status-live-dark: "#4ADE80"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(3rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.02em"
  title:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.5rem"
    fontWeight: 300
    lineHeight: 1.33
    letterSpacing: "-0.0067em"
  body:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.125rem"
    fontWeight: 300
    lineHeight: 1.556
    letterSpacing: "-0.0089em"
  metric:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.12em"
  serif-accent:
    fontFamily: "Times New Roman, Times, Baskerville, Georgia, serif"
    fontSize: "inherit"
    fontWeight: 400
    lineHeight: "inherit"
    letterSpacing: "-0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.bone}"
    rounded: "{rounded.sm}"
    padding: "14px 32px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 32px"
  card:
    backgroundColor: "{colors.bone-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "40px"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  chip-filter-active:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
  status-pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
    typography: "{typography.label}"
  input-search:
    backgroundColor: "{colors.bone-secondary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px"
---

# Design System: Ramshankar Bhuvaneswaran Portfolio

## Overview

**Creative North Star: "The Technical Broadsheet"**

This is a newspaper for one engineer's measurements. Swiss print discipline applied to engineering evidence: numbered section rules marching `01.` through `05.`, a Times italic cutting against Inter at every heading, hairline rules instead of boxes, and margins wide enough that the page breathes at 1280px. The reader arrives mid-triage with a job description open in another tab. The design's job is to get out of the way of a number.

The system is precise, restrained, and quiet, and it is unapologetically dense. Information density is a feature here — the visitor came for substance, and padding the page to feel airy would read as having less to say. What keeps it from becoming a spec sheet is the type: a 300-weight body at 18px with generous leading, and the serif italic that appears exactly where a human name or a section title wants a human voice.

There is almost no color. The accent is pure black in light and pure white in dark, and with one exception every chromatic value in the system is an `rgba` alpha of those two. The exception is a single green on the hero availability dot — one hue, one element, spent deliberately. That restraint is the most load-bearing constraint in the file, and it survives only because the budget is exactly one.

**Key Characteristics:**
- Two-tone per theme plus one sanctioned hue; the accent is the absence or presence of ink
- Numbered section rules as the primary wayfinding device
- Times italic as the only typographic voice change, used sparingly
- Tabular numerals on every metric, because the numbers are the argument
- Hairline 1px rules doing the work borders and shadows usually do
- Flat surfaces at every state

## Colors

A two-tone system that inverts wholesale between themes: one warm off-white family and one near-black family, with a single pure-contrast accent at each end — plus exactly one hue, held in reserve for availability.

### Primary
- **Accent Ink** (`#000000` light / `#FFFFFF` dark): Pure contrast, reserved for the scroll-progress rail, the active filter chip fill, the primary button, and focus rings. Always maximal, never tinted.

### Neutral — the Bone family (light theme)
- **Bone** (`#FAF9F6`): The page. A warm alabaster, deliberately off-white — a true `#FFF` would read as a default, not a decision.
- **Bone Secondary** (`#F2F1EA`): Alternating section grounds and the search bar's recessed field.
- **Bone Card** (`#FFFFFF`): Card surfaces. Pure white reads as *raised* against the warm page without needing a shadow.
- **Ink** (`#111111`): Body headings and every primary string. Deep charcoal, never true black, so it sits with the warm ground.
- **Ink Muted** (`#666666`): Body copy, captions, metric labels.
- **Rule Light** (`#E2E1DA`): Hairlines. Warm enough to disappear into the page.

### Neutral — the Obsidian family (dark theme)
- **Obsidian** (`#080808`): The page. Deeper than most dark modes; a velvet black, not a charcoal.
- **Obsidian Secondary** (`#101010`) / **Obsidian Card** (`#151515`): Layered surfaces. The card is lighter than the page here — the inverse of the light theme's logic, and correct: in dark, raised means lighter.
- **Chalk** (`#F5F5F7`) / **Chalk Muted** (`#A1A1AA`): Primary and secondary text.
- **Rule Dark** (`#222222`): Hairlines.

### The one sanctioned hue
- **Live Green** (`#15803D` light / `#4ADE80` dark): The availability dot in the hero, and nothing else. Darker in light theme so it holds against the bone canvas.

### Named Rules

**The No-Color Rule.** There is exactly one hue in this system — Live Green on the hero availability dot — and it is spent. Any *other* hue introduced here is a bug, including a "subtle" tinted state, a semantic red for errors, or a brand blue inherited from a config file. Everywhere else, state is communicated by ink weight, fill inversion, and rule presence.

**Why the exception holds.** Availability is the only state on this page that changes in the world rather than on scroll, it is the single thing a reader is scanning for, and it is the one claim the monochrome system could not make loudly enough. The hue earns its place by being the only one; a second sanctioned color would dissolve the first.

**The Off-White Rule.** Neither canvas is a pure value. `#FAF9F6` and `#080808` are chosen, and `#FFFFFF` / `#000000` are reserved as accent and card-surface only. Substituting a pure value for a canvas flattens the two-layer depth model that replaces shadows.

**The Always-Dark Surface Rule.** `#agent-mode-overlay` is a permanently dark console in both themes. It rebinds the theme tokens locally rather than fighting the global rules. Any future always-dark or always-light surface follows that pattern — rebind the tokens on the container, never override individual colors downstream.

## Typography

**Display / Body Font:** Inter (with `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif)
**Accent Font:** Times New Roman (with Times, Baskerville, Georgia, serif) — italic, 400, `.serif-italic` only
**Numeric:** Inter with `font-variant-numeric: tabular-nums`

**Character:** One workhorse sans carrying the entire hierarchy through weight and size alone, interrupted at precise intervals by a Times italic that does nothing but signal "a person wrote this." The pairing is a broadsheet convention: neutral body type, editorial voice in the furniture.

### Hierarchy
- **Display** (700, `clamp(3rem, 5vw, 4.5rem)`, 1.1, `-0.025em`): The hero `h1` only. One per page.
- **Headline** (700, 36px, 40px, `-0.02em`): Section titles, paired with a monospace `01.`–`05.` number and a bottom hairline.
- **Title** (700, 24px, 33px, `-0.02em`): Card and project headings.
- **Lead** (300, 24px, 32px): The hero paragraph. Light weight at large size is the signature move — it reads as spoken rather than declaimed.
- **Body** (300, 18px, 28px): About copy. Max measure ~65ch via `max-w-3xl`.
- **Metric** (700, 1.9rem / 2.4rem at `--lg`, tabular-nums, `-0.03em`): Headline numbers in project cards.
- **Label** (600, 12px, uppercase, `0.12em`): Eyebrows, status pills, metric captions, section kickers.

### Named Rules

**The 12px Floor Rule.** No functional text renders below 12px. Metric captions, eyebrows, and status pills all sit exactly at the floor with `0.12em` tracking to stay legible at that size. Monospace blocks inside the agent console may go to 11px; nothing else may.

**The Single Italic Rule.** `.serif-italic` appears in the logo, the hero name, and section titles. That is the complete list. A fourth use dilutes it into decoration.

**The Tabular Rule.** Every number a reader might compare — metrics, latencies, leaderboard ranks — sets in `tabular-nums`. Columns of figures must align on the decimal.

## Layout

A single centered column, `max-width: 1152px` (`max-w-6xl`), with 24px gutters and 64px of vertical page padding. Sections are separated by a **128px** rhythm (`space-y-32`) — the largest single spacing decision in the system and the main reason the page reads as print rather than app.

Cards sit on a two-column grid (`md:grid-cols-2`, 32px gap) that collapses to one below 768px. Featured cards break the grid with `grid-column: 1 / -1` and split internally into a `minmax(0, 240px) 1fr` metric rail plus content. Grid children carry `min-width: 0` so wide children (the systems diagram) scroll inside their own wrapper instead of stretching the card.

Above 1280px, fixed hairline rails appear at `left/right: 2.25rem` with a scroll-progress fill on the right and a vertical social nav bottom-left. These are decorative furniture and are the only elements that appear purely as a function of viewport width.

**Breakpoints:** 768px (grid and featured layout), 1280px (margin rails), `max-width: 767px` (hero canvas opacity), plus `(pointer: coarse), (hover: none)` for touch-target expansion.

**Density:** Card padding 40px, timeline card 32px, section gap 128px, grid gap 32px. Generous inside a container, tight between elements within it.

## Elevation & Depth

**This system is flat.** Surfaces do not lift, at rest or on hover. Depth comes from two devices only: a 1px hairline rule, and tonal layering — in light theme the card is *lighter* than the page (`#FFFFFF` on `#FAF9F6`), in dark theme it is also lighter (`#151515` on `#080808`). The card is always the nearer plane; the direction of the tonal step just reverses with the theme.

There is no shadow vocabulary. The one exception is the hero search bar, which carries `0 4px 20px var(--accent-glow)` — a 4%-alpha ambient wash that reads as a focus affordance on an interactive field, not as elevation.

### Named Rules

**The Flat-Always Rule.** No `box-shadow` on a resting or hovered surface. Hover state is communicated by border color, background tint via `--accent-glow`, or a 2px translate — never by adding depth.

> **Current drift:** the implementation still carries `hover:shadow-xl` on 17 elements, `shadow-2xl` on 2, and `shadow-sm` on 9. The detector flags two of these as "1px border + wide shadow blur." The doctrine above is the target; the code has not caught up. Resolving it is a deletion pass, not a redesign.

## Shapes

A three-step radius scale plus a pill, applied by function rather than by size:

- **8px** (`rounded-lg`) — buttons. The tightest radius, so actions read as the most deliberate shape on the page.
- **12px** (`rounded-xl`) — input fields and timeline cards.
- **16px** (`rounded-2xl`) — content cards, both standard and featured.
- **9999px** (`rounded-full`) — filter chips, status pills, tag pills, icon buttons, the portrait.

Borders are always exactly 1px and always `var(--border-color)`, with one exception: the outline button takes 2px to hold its own against a filled sibling. Nothing in the system is clipped, masked, or angled except the hero canvas, which uses a `linear-gradient` mask to fade the ASCII animation out across the left third so it never competes with the headline.

**The Hairline Rule.** 1px, `var(--border-color)`, no exceptions for emphasis. A heavier border is not available as an emphasis device; use fill inversion instead.

## Components

### Buttons
- **Shape:** Tight radius (8px), 14px × 32px padding
- **Primary:** Accent fill, inverted text — black on bone in light, white on obsidian in dark
- **Outline:** Transparent fill, 2px accent border, accent text
- **Hover / Focus:** 200–300ms `cubic-bezier(0.4, 0, 0.2, 1)`; fill or border shifts, no shadow, no scale
- **Character:** Precise and mechanical. The button is a machined part, not an invitation.

### Chips — filter
- **Style:** Pill, transparent, muted text, 44px tall
- **Active:** Accent fill with inverted text, painted on an inset `::before` at `z-index: -1` so the 44px hit box exceeds the visible pill
- **State:** `aria-pressed` is the source of truth; `.active` carries the visual

### Cards / Containers
- **Corner:** 16px
- **Background:** Card token — always the nearer tonal plane
- **Border:** 1px hairline
- **Shadow:** None. See Elevation.
- **Padding:** 40px (32px on timeline cards)
- **Featured variant:** Spans the full grid width, splits into a metric rail and a content column above 768px

### Inputs
- **Style:** 12px radius, recessed secondary-tone fill, 1px hairline
- **Focus:** 2px accent outline via `:focus-visible`; the field itself does not resize
- **Submit control:** The painted block lives on a `::before` inside a 44×44 button

### Navigation
- **Style:** Fixed, `backdrop-blur`, transparent ground. Links at 15.2px / 500.
- **Active / hover:** A 1px underline animating from `width: 0` to full via an `::after`. Scroll-spy drives `.active`.
- **Mobile:** Hamburger toggles a bordered dropdown; rows are 44px minimum.
- **Contract:** Every `<section id>` must have a matching `#nav-links` href or the scroll-spy blanks the entire nav while that section is onscreen.

### Metric Callout (signature)
A headline figure in tabular numerals (1.9rem, or 2.4rem at `--lg`) with a smaller inline unit and a 12px uppercase caption beneath. Stacks vertically in featured cards' left rail. This is the component that carries the site's argument — every performance claim on the page renders through it.

### Contribution Row (signature)
A three-column hairline-ruled row: subject (15px, primary ink) · description (14px, muted) · status pill, collapsing to stacked rows below 768px. Used for upstream PRs and education. Reads as a table without being one.

### Systems Diagram (signature)
Hand-authored inline SVG on a 960-unit viewBox, all strokes and text at `currentColor` so it inverts with the theme for free. 1px hairlines, dashed cluster boundaries, 12px labels. Wrapped in `<figure role="img">` with `<title>`, `<desc>`, and a visible `<figcaption>`; scrolls horizontally inside `.sys-diagram` below its 680px minimum.

## Do's and Don'ts

### Do:
- **Do** route every color through a CSS custom property. The tokens invert wholesale on `.dark`; a literal hex will not.
- **Do** keep every functional string at 12px or above, with `0.12em` tracking at the floor.
- **Do** set comparable numbers in `tabular-nums`.
- **Do** grep `css/tailwind.min.css` before using any Tailwind utility — it is a frozen hand-maintained subset. `grid-cols-3/4` unprefixed, `tabular-nums`, `border-collapse`, `align-top`, `items-baseline`, `mt-*`, `pt-12`, `sticky`, `min-w-[...]`, and `no-underline` are all absent. Hand-write the rule into `styles.css` instead.
- **Do** give every interactive control a 44×44 hit box, growing it with padding cancelled by negative margin, or with an inset `::before`, so the painted shape never changes.
- **Do** rebind theme tokens on a container when a surface must ignore the theme.
- **Do** keep every claim in real text. An LLM screener reading tag-stripped HTML is a first-class audience; nothing load-bearing may live only in an SVG, a pseudo-element, or JS-rendered DOM.

### Don't:
- **Don't** introduce a *second* chromatic accent. Live Green on the availability dot is the whole colour budget and it is already spent. `tailwind.config.js` still defines an unused blue `primary` ramp (`#3b82f6` and siblings) — it is dead config, not permission.
- **Don't** let the availability dot carry meaning by colour alone. The label beside it ("Open for new opportunities") states the status in words; the dot only draws the eye.
- **Don't** add `box-shadow` to a resting or hovered surface.
- **Don't** use a border heavier than 1px for emphasis, except the established 2px outline button.
- **Don't** extend `.serif-italic` beyond the logo, the hero name, and section titles.
- **Don't** animate a layout property. The scroll rail uses `transform: scaleY()` precisely because `height` thrashed layout on every scroll frame.
- **Don't** blanket-kill motion under `prefers-reduced-motion`. Looping decoration stops; state-change feedback stays perceptible at a ~60ms cap.
- **Don't** remove `data-category` from a `#projects-grid` child or a nav link for an existing section — both crash live behavior.
