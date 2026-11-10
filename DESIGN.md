---
name: Airlock
description: A trust layer for autonomous agents, built on Clocked.
colors:
  clinical-white: "#ffffff"
  raised-white: "#f7f8fa"
  sunken-grey: "#f2f4f7"
  hairline: "#dde2e8"
  hairline-soft: "#eaedf1"
  hover-line: "#c3cad3"
  ink: "#0c1116"
  ink-dim: "#46515c"
  ink-faint: "#66717d"
  safety-ink: "#c8253a"
  safety-fill: "#d4283b"
  safety-soft: "#fdecee"
  safety-line: "#f3c2c8"
  core-ink: "#8f5f00"
  core-fill: "#f2a900"
  core-soft: "#fff5d9"
  core-line: "#f1d79a"
  knowledge-ink: "#067782"
  knowledge-fill: "#0aa5b2"
  knowledge-soft: "#e2f5f7"
  knowledge-line: "#a9dde2"
  pass-ink: "#0f7a44"
  pass-soft: "#e4f4ea"
  info-ink: "#2c58c4"
  hazard-yellow: "#f2b705"
  hazard-black: "#14181d"
typography:
  display:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "clamp(3rem, 6.4vw, 5.6rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Barlow Condensed, Geist, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"cv02\", \"cv03\", \"cv04\""
  body-sm:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.25
  data:
    fontFamily: "Geist Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "\"tnum\", \"zero\""
rounded:
  tag: "6px"
  control: "8px"
  chip: "9px"
  plate: "12px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  section: "96px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.clinical-white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.clinical-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-utility:
    backgroundColor: "{colors.clinical-white}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.tag}"
    padding: "0 10px"
    height: "32px"
  card-plate:
    backgroundColor: "{colors.clinical-white}"
    rounded: "{rounded.plate}"
    padding: "16px"
  plate-band-safety:
    backgroundColor: "{colors.safety-fill}"
    textColor: "{colors.clinical-white}"
    padding: "8px 16px"
  plate-band-core:
    backgroundColor: "{colors.core-fill}"
    textColor: "{colors.ink}"
    padding: "8px 16px"
  plate-band-knowledge:
    backgroundColor: "{colors.knowledge-ink}"
    textColor: "{colors.clinical-white}"
    padding: "8px 16px"
  icon-chip-soft-knowledge:
    backgroundColor: "{colors.knowledge-soft}"
    textColor: "{colors.knowledge-ink}"
    rounded: "{rounded.chip}"
    size: "34px"
  verdict-stamp-block:
    backgroundColor: "{colors.safety-soft}"
    textColor: "{colors.safety-ink}"
    rounded: "{rounded.tag}"
    padding: "6px 10px"
  verdict-stamp-pass:
    backgroundColor: "{colors.pass-soft}"
    textColor: "{colors.pass-ink}"
    rounded: "{rounded.tag}"
    padding: "6px 10px"
  mode-badge:
    backgroundColor: "{colors.knowledge-soft}"
    textColor: "{colors.knowledge-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Airlock

## Overview

**Creative North Star: "The Clean-Room Airlock"**

Airlock is clean-room safety signage on clinical white. Every surface is a plate in a controlled room: white ground, hairline-bordered panels, solid signal colours that mean exactly one thing each. A ticket travels through sealed chambers and each Clocked verdict decides whether the next door opens; the visual system exists to make those verdicts legible at a glance, the way a door sign is legible from across a corridor.

Density is moderate and work-ready. The landing (Persuade) and the console (Operate) share one token set, one icon registry and one chip vocabulary; the console is denser and quieter, the landing larger and more staged. Colour is functional, never ornamental: red is safety, amber is core understanding, cyan is knowledge, green is clear. Condensed signage lettering carries headings; Geist carries everything you read; Geist Mono carries only what a machine produced.

Motion is short, eased out and tied to state. The hero's airlock run is the single authored motion moment; everything else is a settle, a hover, or a chip that plays once when its gate goes live.

**Key Characteristics:**
- White ground across the whole product; depth from hairlines and soft shadows, not tinted backgrounds.
- Three group signal colours with stable meanings, each in ink, fill, soft and line values.
- Hazard stripes as the one loud device, reserved for sealed, locked and held states.
- Lucide icons inside animated icon chips; no emoji, no glyph icons.
- Barlow Condensed display over Geist UI, with Geist Mono for data only.

## Colors

A white clean room with three signage colours and a clear-green, each split into a text-safe ink, a solid fill, a soft wash and a line.

### Primary
- **Signal Ink** (ink): the primary action colour. Primary buttons, the selected attack chip, the selected ticket border, the Mark plate. Near-black does the job a brand hue does elsewhere, so the signal colours stay free to mean something.

### Secondary
- **Safety Red** (safety-ink, safety-fill, safety-soft, safety-line): the Protect, Guard and Inspect group, and every blocked or locked verdict. Fill for the sealed-door lock chip and safety plate bands; ink for text; soft and line for stamps and evidence boxes.
- **Core Amber** (core-ink, core-fill, core-soft, core-line): the Decide, Extract and Fill group, and held or filtered verdicts. The fill is bright signage amber and carries ink text, never white.
- **Knowledge Cyan** (knowledge-ink, knowledge-fill, knowledge-soft, knowledge-line): the Verify, Compare and Rerank group, the focus ring, caret, accent colour and replay-mode badge. The bright fill is graphic-only (Mark ring, selection highlight); solid plates that carry text or icons use the ink.

### Tertiary
- **Clear Green** (pass-ink, pass-soft): an opened door, cleared decision, live mode, "Aria acts".
- **Info Blue** (info-ink): neutral probability bars and Rerank "expand" verdicts in the console.
- **Hazard Yellow and Black** (hazard-yellow, hazard-black): the 45-degree stripe pair, 10px bands.

### Neutral
- **Clinical White** (clinical-white): ground and panel.
- **Raised White** (raised-white): alternate section bands, the gate board's registration-dot grid, expanded gate detail.
- **Sunken Grey** (sunken-grey): quote wells, raw JSON, inactive chips, probability-bar tracks.
- **Hairline / Hairline Soft** (hairline, hairline-soft): card borders and dividers; soft for section rules and inner dividers.
- **Hover Line** (hover-line): border on hover and on an open gate row.
- **Ink Dim / Ink Faint** (ink-dim, ink-faint): body copy and secondary text; metadata, indexes, placeholders.

### Named Rules
**The Ink-For-Text Rule.** Any colour that carries text or an icon uses its ink value (each at least 4.5:1 on white). Fills are for surfaces and graphics. Solid knowledge plates use knowledge-ink, never the bright knowledge-fill; solid core plates carry ink text, never white.

**The One-Meaning Rule.** Red is safety and blocking, amber is core and holding, cyan is knowledge, green is clear. A signal colour never appears as decoration or as a generic accent.

**The Hazard Rule.** Hazard stripes appear only on a sealed, locked or held state: the sealing panel over a sealed door, the band atop a locked or held decision banner, the swatch on a blocked or held verdict stamp. Never as decoration, dividers or section dressing.

## Typography

**Display Font:** Barlow Condensed 600/700 (with Geist, sans-serif)
**Body Font:** Geist (with system-ui, sans-serif), stylistic sets cv02, cv03, cv04
**Label/Mono Font:** Geist Mono (with ui-monospace, Menlo), tabular slashed-zero numerals

**Character:** Condensed signage lettering, set tight and balanced, reads like door plates; Geist underneath is calm and exact. Mono marks machine output so a judge can tell a real reading from prose.

### Hierarchy
- **Display** (700, clamp(3rem, 6.4vw, 5.6rem), 0.9): the landing hero headline only.
- **Headline** (700, clamp(2.2rem, 4.4vw, 3.6rem), 0.95): landing section headings; the closing call uses a smaller clamp(2rem, 3.6vw, 3rem). The console page title sits at 44px.
- **Title** (700, 28px, 1): stage titles, outcome titles, console ticket name.
- **Title Small** (700, 20-26px, 1): door names, endpoint names on cards, decision banner, scenario rows.
- **Body** (400, 15-17px, 1.625, max 56-64ch): section intros and the hero subhead.
- **Body Small** (400, 12.5-14px): card copy, gate headlines, rationale.
- **Label** (600, 12-14px): buttons, nav (13px medium), field names, gate names.
- **Data** (Geist Mono 400-600, 10-13px): endpoint paths, probabilities, credits, door indexes, script lines, raw JSON, recorded readings.

### Named Rules
**The Mono-Is-Data Rule.** Geist Mono is for data, paths, probabilities and code only. Labels, headings and captions are Geist or Barlow, never mono.

**The No-Eyebrow Rule.** Headings stand alone. No small uppercase label above a heading; group identity rides on colour, the plate band, or the heading's own numeral.

## Layout

Content sits in a 1240px container (console 1320px) with 16px gutters, 24px from the sm breakpoint. Landing sections run 80px vertical padding, 96px from sm, divided by soft hairlines and alternating white and raised-white bands. Section heads use a two-column grid on large screens: headline left, intro paragraph right, aligned to the baseline. Endpoint stages use a 260px rail beside a three-up card grid with 12px gaps. The airlock strip is a six-column grid on desktop (five doors plus the agent bay), three columns at sm, two on mobile, where the travelling ticket hides. The console is a 290px ticket rail beside the gate board, collapsing to one column below lg. Responsive breakpoints are Tailwind defaults (sm 640, md 768, lg 1024).

## Elevation & Depth

Hybrid and restrained: plates are hairline-bordered with a near-invisible resting shadow, and lift only to signal selection, hover or primacy. Large tinted surfaces are not used for depth; raised-white bands and sunken-grey wells do the tonal work.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(12,17,22,0.06), 0 1px 1px rgba(12,17,22,0.04)`): every card plate at rest.
- **Lift** (`box-shadow: 0 6px 18px -6px rgba(12,17,22,0.14), 0 2px 4px rgba(12,17,22,0.05)`): selected chips and tickets, primary buttons, the travelling ticket, endpoint-card hover.
- **Stage** (`box-shadow: 0 18px 40px -16px rgba(12,17,22,0.22), 0 4px 10px -4px rgba(12,17,22,0.08)`): the hero airlock strip only.

### Named Rules
**The Lift-Means-State Rule.** A plate moves from Rest to Lift only when it is selected, hovered or the primary action. Stage belongs to the one hero object.

## Shapes

Softly squared signage plates. Cards and door tiles round at 12px, buttons and inner wells at 8px, tags and stamps at 6px, icon chips at 9px, mode badges and status lamps fully round. Borders are 1px hairlines; inset 1px rings stand in for borders on chips and stamps. Hazard swatches round at 3px. Dashed 1px outlines mark a bay not yet reached.

**The Hairline-Only Rule.** Borders are 1px. No coloured side borders above 1px on cards; a quote well may carry a 1px neutral left rule.

## Components

### Buttons
- **Shape:** gently squared (8px); utility buttons 6px.
- **Primary:** ink ground, white label, 44px tall, 20px padding, Lift shadow, trailing arrow.
- **Secondary:** white ground, 1px hairline, ink label, same height.
- **Utility:** 32px, 1px hairline, ink-dim label with a leading icon (Replay).
- **Hover / Focus:** border shifts to hover-line over 0.18s ease-out; press nudges down 1px. Focus is a 2px knowledge-ink outline at 2px offset on every interactive element.

### Chips
- **Icon chip:** 9px-rounded square, soft wash with a 1px inset group line and ink-coloured Lucide icon at about half the chip size, stroke 2. Solid variant uses the group's solid plate colour with a white icon (knowledge uses its ink).
- **Motion:** each endpoint owns one gesture (scan beam, mask blink, stack nudge, signpost tilt, shackle drop) that plays once on hover of the chip or its card, or once when its gate goes live.
- **Verdict stamp:** 6px tag in the tone's soft wash, ink text and 1px inset line; blocked and held stamps lead with a hazard swatch, clear stamps with a check.
- **Mode badge:** pill with a status lamp (solid dot, pale 3px ring, no glow).

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** white; raised-white for expanded detail; sunken-grey for quote and JSON wells.
- **Shadow Strategy:** Rest, Lift on selection or hover (see Elevation & Depth).
- **Border:** 1px hairline; selected tickets take an ink border, open gates the hover line.
- **Internal Padding:** 12-16px.

### Navigation
Sticky 56px top bar on 92% white with a saturated blur and a soft bottom hairline. Mark plus the Barlow wordmark at 22px left; 13px medium ink-dim section links (hidden below md) underline on hover; the primary console action right. On the console the action becomes a quiet sunken-grey current-page marker.

### Signage Plate (endpoint card)
A card whose top band is a solid group plate carrying the endpoint path in mono and the group name in condensed caps: safety on red with white, core on amber with ink, knowledge on knowledge-ink with white, Pipeline on ink. Below: a 40px icon chip and the endpoint name, the one-line effect, and a real reading in a sunken mono well. These cards are the only scroll-revealed element.

### Airlock Door (signature)
A 12px door tile with an index numeral, the lead endpoint's chip and a condensed door name. When sealed, a hazard panel scales down from the top over 0.55s with a red lock chip whose shackle drops; the note beneath takes the state's ink. Open doors take a green line, held and filtered doors amber. The ticket token slides between columns over 0.55s ease-out.

### Decision Banner
A plate in the outcome tone: an 8px hazard band on top when locked or held, a soft-washed header with a solid lock chip and a condensed verdict title in the tone's ink, then a six-fact grid and the reply and rationale.

## Do's and Don'ts

### Do:
- **Do** use each group colour's ink (#c8253a, #8f5f00, #067782) for any text or icon; keep it at 4.5:1 or better on white.
- **Do** put solid knowledge plates on #067782, not #0aa5b2, wherever they carry text or icons.
- **Do** reserve hazard stripes for sealed, locked and held states.
- **Do** keep the hero airlock run the single authored motion moment; scroll reveal is limited to the endpoint grid.
- **Do** use Geist Mono only for data, paths, probabilities and code, with tabular slashed-zero numerals.
- **Do** give every endpoint its Lucide icon inside an animated icon chip.
- **Do** honour reduced motion: the airlock resolves instantly and reveals show at rest.

### Don't:
- **Don't** put white text or icons on the bright cyan (#0aa5b2) or amber (#f2a900) fills.
- **Don't** use hazard stripes as decoration, dividers or section dressing.
- **Don't** add scroll reveal to hero, scenario or closing sections.
- **Don't** set labels, captions or headings in mono.
- **Don't** place eyebrow labels above headings.
- **Don't** use coloured side borders above 1px on cards.
- **Don't** use emoji or glyph icons; use Lucide inside icon chips.
- **Don't** tint the ground; the product stays on white.
