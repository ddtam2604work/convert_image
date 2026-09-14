---
name: Precision Studio Light
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#6b38d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#8455ef'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 12px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  gutter-desktop: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies the clinical focus, creative fluidity, and absolute clarity required by next-generation creative tooling. Designed for photo editors, vector illustrators, and generative design suites, it positions the interface as a silent, high-precision instrument: razor-sharp typography, ultra-refined borders, and deliberate luminous accents that never compete with user artwork.

The visual direction marries Modern Studio Minimalism with architectural precision. High-contrast typography cuts through luminous, neutral-slate canvas layers, while electric violet and cyan highlights indicate active states, vector paths, layer locks, and processing engines. The emotional response is one of dialed-in control, fluid execution, and professional authority.

## Colors

The palette relies on deliberate contrast between light neutral surfaces and high-frequency spectral accents.

- **Primary Canvas & Surfaces**: The background foundation utilizes `#f8fafc` (slate-50) for outer canvas panels, dynamic viewports, and workspace surrounds, transitioning to `#ffffff` for elevated inspector panels, tool palettes, and card surfaces.
- **Borders & Dividers**: Crisp mechanical structure is formed using `#e2e8f0` (slate-200) for standard layout boundaries and `#cbd5e1` (slate-300) for interactive control edges.
- **Accents**: 
  - Primary Accent (`#6366f1` / Indigo-Violet): Drives primary CTAs, selection bounding boxes, keyframe pins, and focus states.
  - Secondary Accent (`#06b6d4` / Cyan): Drives auxiliary feedback, rendering statuses, snapping guidelines, and mask isolations.
  - Tertiary Accent (`#8b5cf6` / Violet): Applied to complex vector paths, AI feature triggers, and generative tool clusters.
- **Typography & Icons**: High-density readability is anchored by `#0f172a` (slate-900) for primary headings, metric values, and primary icons, complemented by `#334155` (slate-700) for secondary labels and input descriptors, and `#64748b` (slate-500) for metadata or shortcut indicators.

## Typography

The type system balances sharp editorial efficiency with technical utility:
- **UI & Display (`Hanken Grotesk`)**: Provides clean geometry with subtle grotesque warmth, keeping inspection labels, toolbars, and contextual dialogs legible at small scales without screen distortion.
- **Telemetry & Technical Values (`JetBrains Mono`)**: Handles all numerical inputs, coordinates (X, Y, W, H), color hex codes, curve controls, and keyboard shortcut glyphs. Monospaced tabular alignment guarantees layout stability during live parameter scrubbing.
- Font smoothing must be set to subpixel antialiasing on standard DPI displays and antialiased on high-DPI displays to maintain razor-thin contrast against light panels.

## Layout & Spacing

This design system uses a flexible 3-tier dock-and-canvas layout:
- **Left Dock**: Tool shelves, toolbars (fixed width: `48px` or `64px`).
- **Center Canvas**: Infinite or viewport-constrained artboard with dynamic fluid scaling.
- **Right Dock**: Layer hierarchy, properties inspector, dynamic histogram panels (fixed width: `280px` to `340px`).

For responsive web and dashboard surfaces:
- **Desktop (>= 1280px)**: Multi-panel layout with pinned inspectors, persistent floating tool bars, `1rem` panel gutters, and `1.5rem` outer canvas padding.
- **Tablet (768px - 1279px)**: Tool docks collapse into vertical icon strips; property inspectors convert to flyout drawers or overlay sheets with `0.75rem` spacing tokens.
- **Mobile (< 768px)**: Canvas takes priority; controls convert to bottom sheets with condensed horizontal tool belts utilizing `space-xs` and `space-sm` for compact touch targets.

## Elevation & Depth

Depth is established through crisp, low-contrast structural borders combined with soft ambient light falloffs:
- **Border-First Architecture**: Every surface card, panel, and dropdown maintains a `1px` continuous border of `#e2e8f0`.
- **Level 0 (Flat / Canvas)**: `#f8fafc` background; zero shadow.
- **Level 1 (Dock & Sidebars)**: `#ffffff` surface, bounded by a `1px solid #e2e8f0` divider. Zero or subtle ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03)`.
- **Level 2 (Cards & Tool Overlays)**: `#ffffff` surface, `1px solid #e2e8f0`, elevated with `0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Modals, Popovers & Context Menus)**: `#ffffff` surface, `1px solid #cbd5e1`, elevated with `0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)`.
- **Active Selection Glow**: When nodes, layers, or inputs are active, supplement shadows with an ambient indigo ring: `0 0 0 1px #6366f1, 0 0 12px -2px rgba(99, 102, 241, 0.25)`.

## Shapes

The shape system blends modern rounded containers with precision-molded pills:
- **Panels & Cards (`rounded-xl` / 1.5rem)**: Large structural viewports, inspector sheets, and modal cards use extended radii to create an inviting, humanized workspace.
- **Interactive Controls (`rounded-lg` / 1rem)**: Standard buttons, text inputs, slider tracks, and color pickers maintain structured soft corners.
- **Pill Badges & Status Indicators (`rounded-full` / 9999px)**: Tag chips, zoom presets, layer visibility badges, and tool shortcut keys use full circular ends to visually differentiate metadata from actionable rectangular inputs.

## Components

### Buttons
- **Primary**: Background `#6366f1`, text `#ffffff`, border `1px solid transparent`, corner radius `1rem` (`rounded-lg`). On hover: `#4f46e5` with subtle indigo lift `0 4px 12px rgba(99, 102, 241, 0.3)`.
- **Secondary / Studio**: Background `#ffffff`, text `#0f172a`, border `1px solid #e2e8f0`. On hover: border `#cbd5e1`, background `#f8fafc`.
- **Ghost / Icon Tool**: Background `transparent`, text `#334155`, corner radius `0.5rem`. On hover: background `#f1f5f9`, text `#0f172a`. Active tool state: background `#e0e7ff`, text `#4338ca`.

### Input Fields & Scrubbers
- **Numeric & Coordinate Inputs**: Background `#ffffff`, border `1px solid #e2e8f0`, text font `JetBrains Mono` (`label-md`), text color `#0f172a`. On focus: border `#6366f1`, ring `0 0 0 1px #6366f1`.
- **Inline Scrubbers**: Label prefixed in `#64748b` (e.g., `X`, `Y`, `W`, `H`) with cursor `ew-resize`. Active dragging shows `#06b6d4` under-bar indicator.

### Chips & Pill Badges
- **Pill Badges**: Fully rounded (`rounded-full`), padding `0.25rem 0.625rem`. Background `#f1f5f9`, border `1px solid #e2e8f0`, font `JetBrains Mono` (`label-xs`).
- **Status Badges**:
  - Processing: Background `#ecfeff`, border `#a5f3fc`, text `#0891b2`.
  - Active Selection: Background `#eef2ff`, border `#c7d2fe`, text `#4f46e5`.

### Cards & Property Panels
- **Inspector Section Cards**: Background `#ffffff`, border `1px solid #e2e8f0`, radius `1.5rem` (`rounded-xl`), inner padding `space-md` (`0.75rem`).
- **Section Headers**: Compact layout containing `headline-sm` with right-aligned collapse toggles or action dots.

### Lists & Layer Trees
- **Layer Rows**: Height `32px`, corner radius `0.5rem`, padding `0 0.5rem`. Alternating states:
  - Default: Transparent background.
  - Hover: Background `#f8fafc`.
  - Selected: Background `#eef2ff`, left accent border `2px solid #6366f1`, text `#1e1b4b`.
- **Drag Handle & Nesting**: Indentation of `12px` per nesting level with fine guide line `#e2e8f0`.

### Checkboxes & Radio Controls
- **Checkboxes**: Dimension `16px x 16px`, border `1.5px solid #cbd5e1`, corner radius `4px`. Checked state: background `#6366f1`, border `#6366f1`, icon checkmark white.
- **Radio Buttons**: Dimension `16px x 16px`, circular. Selected state: outer ring `#6366f1`, inner dot `#6366f1` with white spacing gap.

### Sliders & Canvas Controls
- **Sliders**: Track height `4px`, background `#e2e8f0`, filled track `#6366f1`. Thumb: `14px x 14px` circle, background `#ffffff`, border `2px solid #6366f1`, shadow `0 1px 3px rgba(15, 23, 42, 0.15)`.
- **Transform Anchors**: `8px x 8px` squares, background `#ffffff`, border `1.5px solid #6366f1`.