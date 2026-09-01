---
name: Beloved AI Grants
description: Warm Ink Workshop — foundation gold and parchment for a builder-facing grant control plane
colors:
  foundation-gold: "#bc9474"
  aged-bronze: "#896142"
  near-ink: "#080808"
  soft-parchment: "#e9dbd1"
  warm-paper: "#f7f2ec"
  cream-wash: "#faf6f1"
  card-cream: "#fffcf9"
  ink-text: "#161616"
  taupe-secondary: "#442f21"
  muted-taupe: "#5c534c"
  warm-border: "#d8c4b2"
  soft-taupe: "#efe6de"
  accent-taupe: "#e4d2c4"
  destructive: "#a33b3b"
typography:
  display:
    fontFamily: "Raleway, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Raleway, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Raleway, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Source Sans 3, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Source Sans 3, Avenir Next, Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.28em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "3.5px"
  lg: "4px"
  xl: "8px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.foundation-gold}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.aged-bronze}"
    textColor: "{colors.ink-text}"
  button-primary-lg:
    backgroundColor: "{colors.foundation-gold}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "0 32px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.aged-bronze}"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.lg}"
    padding: "4px 12px"
    height: "36px"
  card-default:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "24px"
  badge-default:
    backgroundColor: "{colors.foundation-gold}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
  nav-public:
    backgroundColor: "{colors.near-ink}"
    textColor: "{colors.soft-parchment}"
  ink-callout:
    backgroundColor: "{colors.near-ink}"
    textColor: "{colors.soft-parchment}"
    rounded: "{rounded.sm}"
    padding: "40px 24px"
---

# Design System: Beloved AI Grants

## Overview

**Creative North Star: "Warm Ink Workshop"**

Beloved AI Grants sits in a workshop of warm paper and near-ink chrome: foundation materials from Beloved in Christ, arranged for builders who need clarity more than ceremony. The palette is locked to belovedinchristfoundation.org (Foundation Gold, Aged Bronze, Near Ink, Soft Parchment / Warm Paper). Aesthetic up-leveling is welcome — sharper hierarchy, more confident primary actions, better claim/key-reveal moments — as long as those colors remain the brand spine.

The mood is calm, light-handed, and trustworthy. Public surfaces reject SaaS purple gradients, neon glow, glassmorphism, and dense dashboard chrome. Depth is mostly tonal (ink bars against parchment fields) with restrained shadows at rest; primary CTAs and key-reveal moments may carry slightly stronger lift so the next action feels tactile and sure.

Typography today is Raleway (light display) + Source Sans 3 (body), foundation-aligned. The **color system is binding**; the type pairing is the incumbent baseline and may be up-leveled later toward a more builder-credible stack without abandoning warmth.

**Key Characteristics:**
- Foundation gold / parchment / near-ink palette (brand-locked)
- Warm Ink Workshop: paper field + ink chrome, not marketing-poster layouts
- Confident, tactile primary actions; quiet secondary chrome
- Flat-by-default with intentional lift on CTAs and key reveal
- Tech-community UX patterns; ministry voice without decorative excess
- Mobile-first public flows; denser admin is allowed but still on-palette

## Colors

A warm, low-chroma foundation palette: gold as the single accent voice, parchment as the working surface, near-ink as authoritative chrome.

### Primary
- **Foundation Gold** (`#bc9474`): Primary actions, focus rings, selection wash, brand links on ink, badge fills. The only accent that should “speak” on a screen.
- **Aged Bronze** (`#896142`): Hover deepen for primary buttons, section labels, in-copy links on parchment. Gold’s working depth, not a second brand color.

### Secondary
- **Soft Parchment** (`#e9dbd1`): Secondary surfaces, ink-on-parchment text roles, header/footer companion tone.
- **Accent Taupe** (`#e4d2c4`) / **Soft Taupe** (`#efe6de`): Hover washes and muted fills — never competing with gold.

### Neutral
- **Near Ink** (`#080808`): Public/admin header and footer chrome; ink callout panels; maximum authority band.
- **Warm Paper** (`#f7f2ec`) / **Cream Wash** (`#faf6f1`): Page field (gradient wash into Warm Paper).
- **Card Cream** (`#fffcf9`): Raised cards and popovers on the paper field.
- **Ink Text** (`#161616`): Body foreground on parchment.
- **Muted Taupe** (`#5c534c`) / **Taupe Secondary** (`#442f21`): Secondary copy and secondary-button text.
- **Warm Border** (`#d8c4b2`): Default borders and inputs.
- **Destructive** (`#a33b3b`): Revoke / error only — never decorative.

### Named Rules
**The One Gold Rule.** Foundation Gold is the sole accent voice. It should feel scarce on parchment screens (CTAs, labels, focus) and more present only on Near Ink chrome where it is the brand signal.

**The Palette Lock Rule.** Hue values stay aligned to belovedinchristfoundation.org. Up-level composition, type, motion, and elevation — do not invent a new accent family (no purple, electric blue, or neon).

## Typography

**Display Font:** Raleway (with ui-sans-serif / system fallbacks) — incumbent, foundation-aligned  
**Body Font:** Source Sans 3 (with Avenir Next / Segoe UI fallbacks) — incumbent  
**Mono Font:** Geist Mono — keys, tokens, technical snippets  

**Character:** Light display weight for generosity and calm; body at light weight for readable long copy; uppercase micro-labels with wide tracking for workshop sectioning. Type pairing may be refined later for builder credibility; keep warmth and the gold/ink/parchment system intact when that happens.

### Hierarchy
- **Display** (300, clamp ~2.25–3.75rem, tight tracking): Public hero headlines only.
- **Headline** (300, ~1.5–1.875rem): Section titles on public pages.
- **Title** (400, ~1.125rem): Card titles, admin headings.
- **Body** (300, 1rem, relaxed leading): Explanatory copy; prefer `text-pretty` and ~65ch comfort on public.
- **Label** (500, ~11px, 0.18–0.28em tracking, uppercase): Section labels, nav links on ink chrome.
- **Mono** (400): API keys and technical values at claim/reveal.

### Named Rules
**The Soft Display Rule.** Display and headlines stay light (300–400). Do not bold the brand voice into a SaaS “Impact” weight.

**The Label Whisper Rule.** Uppercase tracked labels introduce sections; they must not outshout the headline.

## Layout

Public content measures around `max-w-2xl` inside a `max-w-5xl` shell; admin uses `max-w-6xl` for denser tables. Horizontal padding is typically 16px (`px-4`); public vertical rhythm uses large section gaps (~64px) with gold hairline dividers (`border-brand-gold/30`). Mobile-first: stack CTAs, wrap nav, keep claim forms single-column.

**The Two-Shell Rule.** Public = mobile-first, sparse, task-focused. Admin = desktop-first, denser tables OK — same palette, not a second visual brand.

## Elevation & Depth

Default surfaces are flat. Depth comes from Near Ink chrome against Warm Paper, Soft Parchment borders at low opacity, and a soft fixed radial gold wash behind the page. Resting cards and buttons use a light `shadow-sm` only.

Primary actions and key-reveal moments may use slightly stronger lift (deeper shadow or clearer contrast shift on hover to Aged Bronze) so the critical path feels tactile — not floating glass panels.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.05)`): Buttons, cards, inputs at rest.
- **Action lift** (stronger than rest, still subtle): Primary CTA hover and key-reveal container — intentional, rare.

### Named Rules
**The Flat-By-Default Rule.** No multi-layer glow stacks. If it looks like neon SaaS, it is wrong.

**The Lift-With-Purpose Rule.** Extra elevation is reserved for primary actions and key reveal — not every card.

## Shapes

Corners are tight and workshop-like: base radius ~4px (`0.25rem`), small variants slightly tighter, `xl` ~8px for alerts. Prefer softly squared controls over pills. Cards and ink callouts use thin Foundation Gold borders at reduced opacity (~25–40%) rather than heavy outlines.

**The No-Pill Rule.** Avoid `rounded-full` chrome for primary actions and badges; keep the square-warm geometry of the foundation system.

## Components

### Buttons
Confident and tactile. Primary fills Foundation Gold with Ink Text; hover deepens to Aged Bronze. Large primary CTAs use uppercase wide tracking. Outline sits on Card Cream with Warm Border; ghost is wash-only; link variant uses Aged Bronze underline.

- **Shape:** Soft square (~4px)
- **Primary:** Gold fill, ink text, light rest shadow; hover → Aged Bronze
- **Focus:** 1px ring in Foundation Gold
- **Large CTA:** taller (44px), uppercase, tracked

### Badges
Uppercase micro-labels (~10px, wide tracking). Default = gold on ink-text; secondary = parchment family. Used for live/fake mode chips in admin — informational, not decorative confetti.

### Cards / Containers
Card Cream on Warm Paper, Soft Gold border at ~25% opacity, light rest shadow, ~24px internal padding. Do not card the entire public narrative; cards are for interactive or grouped admin content.

### Inputs / Fields
Transparent field, Warm Border stroke, ~36px height, focus ring Foundation Gold. Errors use Destructive; never color the whole form gold.

### Navigation
Near Ink bar, Soft Parchment brand mark, uppercase gold nav links that brighten to parchment on hover. Public: brand + sparse links. Admin: Dashboard · MCP + mode badges + sign out. Footer repeats ink band with gold micro-links (including Admin).

### Ink Callout (signature)
Near Ink panel with gold border (~40% opacity), parchment type, gold links — used for program-invite / organizer-path moments on the public home. Signature contrast move of the Warm Ink Workshop.

### Brand Mark
Cross mark SVG + “Beloved in Christ” tracked gold label + product subtitle in parchment. Lives on ink chrome; do not recolor off-palette.

## Do's and Don'ts

### Do:
- **Do** keep Foundation Gold / Aged Bronze / Near Ink / Soft Parchment / Warm Paper as the only brand color spine.
- **Do** up-level hierarchy, spacing, and CTA/key-reveal craft while staying on-palette.
- **Do** use Near Ink for authoritative chrome and callouts; Warm Paper for the working field.
- **Do** treat primary actions as tactile (clear hover deepen, purposeful lift).
- **Do** design public claim flows mobile-first and localization-friendly (no brittle English-width layouts).

### Don't:
- **Don't** introduce purple, indigo, neon, or cool-gray SaaS palettes.
- **Don't** use glow stacks, gradient text, or glassmorphism as decoration.
- **Don't** turn public pages into dense admin dashboards.
- **Don't** overuse Foundation Gold — scarcity on parchment is the point.
- **Don't** invent testimonials, metrics, or imagery claims not grounded in product truth.
