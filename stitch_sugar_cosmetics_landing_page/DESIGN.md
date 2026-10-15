---
name: Ethereal Botanical Luxury
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#514344'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#837374'
  outline-variant: '#d6c2c2'
  surface-tint: '#835054'
  primary: '#835054'
  on-primary: '#ffffff'
  primary-container: '#d89a9e'
  on-primary-container: '#5f3136'
  inverse-primary: '#f7b6ba'
  secondary: '#516449'
  on-secondary: '#ffffff'
  secondary-container: '#d0e6c5'
  on-secondary-container: '#55684d'
  tertiary: '#855143'
  on-tertiary: '#ffffff'
  tertiary-container: '#da9b8a'
  on-tertiary-container: '#5f3226'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#f7b6ba'
  on-primary-fixed: '#340f14'
  on-primary-fixed-variant: '#68393d'
  secondary-fixed: '#d3e9c8'
  secondary-fixed-dim: '#b7cdad'
  on-secondary-fixed: '#0f1f0b'
  on-secondary-fixed-variant: '#394c33'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#fab7a5'
  on-tertiary-fixed: '#341007'
  on-tertiary-fixed-variant: '#693a2d'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '400'
    lineHeight: 38px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style

This design system embodies an airy, tactile, and quiet luxury aesthetic tailored for an intentional, ritualistic skincare experience. It fuses high-end editorial minimalism with soft organic warmth—rejecting sterile clinical white in favor of velvety creams, diffused botanical hues, and delicate luminosity.

### Target Audience & Emotional Intent
- **Audience:** Discerning beauty enthusiasts, dermatological minimalists, and individuals who view daily skincare as an essential sensory ritual rather than a cosmetic chore.
- **Atmosphere:** Serene, restorative, and luminous. The interface should feel like stepping into a sun-drenched marble bathroom lined with fresh botanicals and warm morning light.
- **Design Style:** Modern Soft Minimalist Luxury with ambient, diffused light. The aesthetic uses generous negative space, refined serif titles paired with immaculate neutral sans-serif body type, ultra-subtle borders, and soft glowing ambient drop shadows.

## Colors

The palette draws inspiration from mineral powders, wild herbal tinctures, and porcelain surfaces illuminated by dawn light.

### Palette Architecture
- **Primary (`#D89A9E` — Dusty Blush Rose):** Used for focal brand moments, active tab highlights, premium badge accents, and subtle gradient stops. Represents gentle radiance and vitality.
- **Secondary (`#A3B899` — Soft Sage):** Represents botanical purity, restorative herbs, and ingredient efficacy. Used for secondary CTAs, organic certifications, and wellness status tags.
- **Tertiary (`#B87D6D` — Muted Terracotta):** Deep, grounding earth pigment used for interactive highlights, text emphasis, and delicate border lines where rose gold warmth is desired.
- **Neutral (`#FBF8F3` — Clotted Cream & Silk):** The foundational canvas. Eliminates glare by using warm butter-tinted parchment undertones instead of pure `#FFFFFF`.
- **Accent Mist (`#D5CFE1` — Lavender Mist):** Optional ethereal atmospheric fill used for hover states, subtle card backdrops, and gradient washes.
- **On-Neutral Deep (`#2D2726` — Espresso Mineral):** High-contrast yet soft charcoal-espresso tone used for legible typography without the harshness of pure black.

### Surface Color Logic
- **Canvas Base:** `#FBF8F3` (Alabaster Cream)
- **Surface Elevation 1 (Cards, Modals):** `#FFFFFF` with 70% opacity and blurred backdrop, or pure `#FFFDF9`.
- **Subtle Dividers & Outlines:** `#EFE8DE` (delicate clay wash).

## Typography

The typographic hierarchy pairs the literary elegance of **Newsreader** (display and headlines) with the soft, modern legibility of **Plus Jakarta Sans** (body, captions, and micro-copy).

### Usage Directives
- **Editorial Tone:** Use italicized variants of Newsreader sparingly in hero headings or collection titles to evoke refined editorial taste (e.g., *Hydration* Redefined).
- **Tracking:** Headings utilize tight negative letter spacing to preserve high-fashion tension, whereas all uppercase labels (`label-sm`, `label-md`) use generous letter-spacing (+0.04em to +0.08em) for crisp clarity.
- **Body Hierarchy:** Never use deep blacks; default to `#352F2E` for primary text and `#7A726E` for secondary notes or dermatological ingredient details.

## Layout & Spacing

The layout philosophy relies on unhurried luxury—prioritizing expansive negative space, breathing room between editorial imagery, and structured asymmetry over dense data grids.

### Grid & Breakpoints
- **Desktop (≥1200px):** 12-column fluid grid, max-width 1360px centered. Margin is `3rem`, gutter is `1.5rem`.
- **Tablet (768px – 1199px):** 8-column fluid grid. Margin is `2rem`, gutter is `1.25rem`.
- **Mobile (<768px):** 4-column fluid grid. Margin is `1.25rem`, gutter is `1rem`.

### Composition Rules
- **Product Spotlights:** Feature wide vertical padding (`space-xl` or greater) around hero products to invoke a tranquil gallery feel.
- **Content Stacking:** Maintain a strict vertical rhythm where metadata and micro-labels reside `space-xs` to `space-sm` from headers, while narrative sections separate by `space-xl`.

## Elevation & Depth

Visual hierarchy abandons hard drop shadows in favor of **ambient diffused glows** and layered porcelain translucency.

### Depth Stratification
1. **Level 0 (Canvas):** Smooth solid warm cream (`#FBF8F3`).
2. **Level 1 (Ambient Cards):** Translucent porcelain layer (`#FFFFFF` at 85% opacity, backdrop-filter `blur(12px)`) with a hairline border (`#F0E9DF`) and an ambient, ultra-wide soft glow:
   `box-shadow: 0 16px 36px -12px rgba(216, 154, 158, 0.12), 0 4px 16px 0 rgba(163, 184, 153, 0.08);`
3. **Level 2 (Floating Popovers, Cart Drawers, Hovered Elements):**
   `box-shadow: 0 24px 48px -10px rgba(184, 125, 109, 0.14), 0 8px 24px -4px rgba(45, 39, 38, 0.04);`
4. **Interactive Focus Glow:** An ethereal halo using `0 0 0 3px rgba(216, 154, 158, 0.35)` to replace standard browser outlines.

## Shapes

The form language uses organic architectural contours: welcoming, curved corners that evoke river stones and cosmetic jars, without becoming entirely circular except for specific pill utility badges.

- **Base Corner Radius (`rounded`):** `0.5rem` (8px) for inputs, small cards, and toggles.
- **Large Corner Radius (`rounded-lg`):** `1rem` (16px) for product cards, modals, and image frames.
- **Extra Large Corner Radius (`rounded-xl`):** `1.5rem` (24px) for prominent feature banners and hero treatment modules.
- **Pill Formats:** Reserved exclusively for action buttons, filter tags, and regimen step badges.

## Components

### Buttons
- **Primary Action (Velvet Rose or Terracotta):** Full pill-shaped (`rounded-full`). Background is either `#B87D6D` or a soft gradient from `#D89A9E` to `#B87D6D`. Text is crisp `#FFFFFF` or pale cream (`#FBF8F3`) with `label-md` uppercase tracking. Hover shifts the ambient shadow outward and provides a gentle scale (1.01).
- **Secondary Action (Dew Outline):** Pill-shaped with a 1px border of `#D89A9E` or `#A3B899`. Background is transparent cream or 40% translucent white with matching text tone.
- **Ghost/Tertiary Action:** No border; subtle underline that expands from center on hover, styled in `label-md` with terracotta accent.

### Chips & Badges
- **Ingredient & Benefit Tags:** Fully rounded pills in tinted pastel washes:
  - Botanical/Clean: `#A3B899` at 15% tint with deep sage `#3E5235` text.
  - Soothing/Hydration: `#D5CFE1` at 25% tint with deep lavender `#473D56` text.
  - Active Formula: `#D89A9E` at 20% tint with terracotta `#6B3B32` text.

### Product & Editorial Cards
- **Structure:** Framed with `rounded-lg` corners, frosted milk-glass background (`rgba(255, 255, 255, 0.75)`), and 1px border of `#EFE8DE`.
- **Media Presentation:** Product photography sits on soft cream backgrounds with generous internal padding (`space-lg`), never edge-to-edge, maintaining an art-gallery presentation.
- **Hover Transition:** Smooth lift accompanied by an elevated rosy glow.

### Form Inputs
- **Fields:** Rounded rectangular (`rounded`, 8px). Light parchment background (`#FFFFFF` or `#F7F2EB`) with a subtle border (`#E4DCD3`).
- **Focus State:** Border transitions to `#B87D6D` accompanied by a soft diffused glow ring: `0 0 0 3px rgba(216, 154, 158, 0.25)`.
- **Labels:** Positioned outside or floating using `label-sm` in dark espresso `#4E4644`.

### Checkboxes & Radios
- **Design:** Soft rounded checkbox (`rounded`, 4px) and circular radio. Unselected: 1.5px border of `#D5CFE1`. Selected: Solid `#B87D6D` or `#A3B899` fill with a pure cream checkmark or central indicator dot.

### Routine / Regimen Step Timeline (Specialty Component)
- **Visuals:** Thin vertical or horizontal connecting trace in `#E0D7CC` anchored by delicate circular steps. Active step features a pulsing pastel halo (`rgba(216, 154, 158, 0.3)`), guiding the user smoothly through morning and evening rituals.