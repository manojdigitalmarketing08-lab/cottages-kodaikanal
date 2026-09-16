# Travels in Kodaikanal — Design Plan (v2, original layout)

## What changed from v1
v1 mirrored the reference page's structure 1:1, which is why it counted 15 items — it split every paragraph/bullet group into its own numbered entry even where the live page has no visual break between them (no bg change, no spacing jump, no new card). Counted the way a visitor actually sees the page, that's ~8-9 bands, which matches what you saw.

This version drops the stacked-static-section approach entirely (photo → paragraph → photo → paragraph, repeated) and consolidates the same content into fewer, more purposeful bands with real interaction design — not a copy of the reference site's layout.

## Identity
A hub page that showcases Kodaikanal's travel experiences and funnels visitors into existing booking pages (tour packages, cab/taxi/jeep-safari, stays). Primary action: pick a tour/package → enquire via WhatsApp/call. Keeps the site's existing color tokens and Poppins type (so it doesn't clash with the rest of the site) but the *layout and interaction model* are original.

## Token System (inherited, unchanged)
- `--color-primary #145066` headings/nav/buttons · `--color-primary-light #1f7592` hover · `--gradient-cta #22a6d9` / `--color-highlight #4dd9ff` CTAs & active states · `--color-steel #cdeef2` / `--color-bg-alt #eaf7fa` alternating surfaces · `--color-star #f5a623` ratings only · `--color-pin #e0483e` map/location only · `--color-text #1c1f24` / `--color-text-muted #5c6a6d` / `--color-border #dfeaec`
- Type: Poppins only, hierarchy by weight/size (H1 40–48/700, H2 28–32/700, H3 20–22/600, body 16/400)
- Spacing: 8px base unit, 96px/56px section padding (desktop/mobile), 1200px container
- Restraint ceiling: 6 colors, 2 radii (12px cards / 999px pills), 1 font family, motion kept to entrance + hover states listed below — nothing decorative running on a loop

## Layout DNA — one distinct construction per section
No two content sections may share a structural pattern (grid, split, rail, etc.) — each row below is a different shape so the page never repeats itself visually:

| # | Section | Construction | Shares pattern with |
|---|---|---|---|
| 2 | Hero | full-bleed asymmetric overlay + floating pill nav | none |
| 3 | Intro + Stats | diagonal-cut two-panel (not a plain 50/50 column split) | none |
| 4 | Featured Tours | horizontal scroll-snap rail, off-axis (only content that scrolls sideways) | none |
| 5 | Experience Explorer | tabbed side-rail + swap panel (only tabbed UI on the page) | none |
| 6 | Packages | staggered-offset row + segmented filter (only vertically-offset cards) | none |
| 7 | CTA band | angled/clipped full-bleed color band, not a plain rectangle | none |

Every section is confirmed unique below.

## Section-by-Section Plan (8 visible bands, matches what you see live)

### 1. Header
Shared include, unchanged: `<div id="site-header" data-include="partials/header.html"></div>`.
**New interaction:** on scroll past the hero, header background switches from transparent-over-hero to solid `--color-bg` with a 1px `--color-border` shadow (standard scroll-shrink pattern) — only page-specific addition, done via a small IntersectionObserver watching the hero.

### 2. Hero — full-bleed, interactive
- Full-bleed photo, `--color-primary-dark` gradient overlay bottom third. H1 exactly **"Travels in Kodaikanal"**, one-line subhead, single CTA ("Plan Your Trip").
- **Interaction:** a thin horizontal **jump-nav strip** anchored to the bottom edge of the hero (not sticky yet) with pills — Tours · Stay · Getting Here · Do & See · Packages — clicking smooth-scrolls to that band and marks it active. This replaces the reference page's plain scroll-only navigation and gives the page a real wayfinding device.
- On scroll past hero, this pill strip **docks into the header** (slides up, becomes sticky) so users always have quick access to jump between bands — a mechanic the reference page does not have.
- `<h1>`, image alt "Misty hills of Kodaikanal, Tamil Nadu".

### 3. Intro + Stats band (merges old §3 Intro + §4 Tagline)
- **Not a plain 50/50 column split** (that's a generic pattern) — a diagonal-cut two-panel: left panel is `--color-bg` white holding the intro paragraph + "Your Kodaikanal Adventure Awaits." as a large pull-line; right panel is a `--color-primary` solid field, the two separated by a ~6° angled edge (clip-path) instead of a straight vertical divider. The 3 stat counters ("6 Signature Tours", "10+ Years Local Expertise", "24/7 Support") sit inside the angled color panel in white, stacked vertically with generous spacing rather than in a horizontal row — this is the only diagonal/angled geometry on the page, used once so it reads as a signature moment, not a template.
- **Interaction:** counters animate once via IntersectionObserver, no re-trigger on re-scroll.
- Mobile: angle flattens to a horizontal stack (white block over solid-color block), diagonal only renders ≥768px.

### 4. Featured Tours — horizontal scroll-snap carousel
- Instead of a static 3-col grid (the reference page's/v1's approach), the 6 tour cards (Valley, Village, Picnic, Berijam Lake, Park, Adventure) sit in a **horizontal scroll-snap rail**: peek of the next card visible at the right edge, drag/swipe on touch, arrow buttons + scroll-progress dots on desktop.
- **Interaction:** each card image sits under a subtle zoom-on-hover (scale 1.0→1.06, 400ms), title + one-line teaser slide up from a translucent `--color-primary-dark` scrim on hover/focus (revealed by default on touch devices). "Book Now" appears inside that reveal, not as a permanent visible link — keeps the resting state clean.
- `<section aria-label="Featured Tours">`, `<article>` per card.

### 5. Experience Explorer — tabbed module (merges old §6–10: Accommodation, Transportation, Guided Tours, Activities, Shopping)
This is the biggest structural departure from the reference page, which stacks these as five separate photo+paragraph sections in a row. Instead: **one module, one heading ("Everything You Need, In One Place"), five tabs** — Stay · Getting Here · Guided Tours · Activities · Local Finds.
- Left rail (desktop) / horizontal scroll chips (mobile): the 5 tab labels, icon + label, active tab in `--gradient-cta` with a sliding indicator bar that animates to the selected tab's position.
- Right panel: content for the active tab only — swaps with a quick 200ms crossfade + 8px slide. Each tab's content is sized to its actual density (Stay = 2 property mentions + links; Getting Here = transport list + pill-links to car-hire/taxi/cab/jeep-safari pages; Guided Tours = 4-item landmark list; Activities = 3 tiles; Local Finds = shopping copy + image).
- **Why this is better than 5 stacked sections:** it turns five passive read-and-scroll blocks into one interactive decision surface, shortens the page significantly, and is a layout the reference site doesn't use at all — directly addresses "make it unique."
- Default active tab: "Stay" (highest commercial intent).
- SEO note: since content is tab-hidden, all 5 tabs' content must be in the DOM (not lazy-injected) with `hidden` attribute toggled, so it's still crawlable/indexable; each tab panel keeps its own `<h3>`.

### 6. Packages — staggered-offset row + segmented filter (merges old §11–14: Closing Summary, Packages Overview, Final Service Description, Duration Listings)
- Short one-line intro (replaces the old standalone "Closing Summary" + "Final Service Description" paragraphs — condensed to a single supporting line under the section heading).
- **Interaction:** a segmented control (pill tab group) — 1 Day · 2 Days · 3 Days · Group — plus combinable category tags (Sightseeing/Adventure/Honeymoon/Family). Selecting filters the row below via fade+shift.
- **Layout — not a uniform equal-height card grid** (that would repeat §4's card shape): cards sit in a single row (desktop) with **alternating vertical offset** — every other card sits ~32px lower, creating a zigzag skyline instead of a flat aligned row. On mobile the offset collapses and cards stack normally. This is the only vertically-staggered layout on the page, giving §6 its own silhouette distinct from §4's flush horizontal rail.
- Cards: image, title, duration badge, price-from, CTA in `--gradient-cta`.
- Background `--color-bg-alt` to separate it from §5.

### 7. CTA / Trust band (new — not in reference page, added for conversion)
- **Not a plain rectangular color block** (that would echo the flat solid-color use in §3's diagonal panel) — an angled/clipped full-bleed band: top and bottom edges both cut at a slight opposing angle (clip-path, mirrored from §3's angle direction so it doesn't feel like a repeat), `--color-primary` fill. Short trust line + phone/WhatsApp CTA pair sit centered inside the clipped shape, side by side.
- This is the page's second-heaviest visual moment (after hero) and the last thing before the footer — deliberately static (no motion) to give the page a resting beat.

### 8. Footer
Shared include, unchanged: `<div id="site-footer" data-include="partials/footer.html"></div>` + `<div id="site-floating-cta" data-include="partials/floating-cta.html"></div>`.

## Interaction Inventory (summary, so nothing gets missed in build)
| Element | Interaction |
|---|---|
| Header | scroll-shrink from transparent → solid |
| Hero jump-nav | click-to-scroll pills, docks into sticky header on scroll |
| Stats row | count-up on scroll-into-view, once only |
| Tour carousel | scroll-snap drag/swipe, arrow nav, hover image-zoom + scrim reveal |
| Experience Explorer | tab switch, sliding active indicator, crossfade panel swap |
| Packages | segmented duration filter + combinable category tags, animated card filter |
| CTA band | static, no motion (deliberate contrast/rest before footer) |

## Visual Flow Summary
Hero (heaviest, interactive wayfinding) → quiet stat/intro band → horizontal-motion carousel (new axis of movement, not just vertical scroll) → interactive tabbed explorer (the page's centerpiece, replaces 5 static bands) → filterable package grid (second conversion moment) → still trust/CTA band (deliberate calm before footer) → footer. Motion is concentrated in 3 & 4 & 5 (the "explore" phase); 3, 7 stay calm — this is the alternation, not left/right image mirroring like v1.

## SEO Structure Summary
- `H1`: "Travels in Kodaikanal" (hero only)
- `H2`: one per band — Kodaikanal at a Glance / Featured Tours / Everything You Need, In One Place / Plan Your Trip (Packages) / Ready When You Are (CTA)
- `H3`: tab titles inside Experience Explorer, card titles in carousel/packages
- Tab panels stay in DOM (not injected on click) for crawlability; each carries its own `<h3>`
- Schema.org: `TouristTrip`/`TouristAttraction` for tour cards, `Product`+`Offer` for package cards (duration+price), `Organization` in footer

## Self-Critique Log
- Replaced the reference page's five repeated photo+paragraph stacked sections with a single interactive tabbed module — the single biggest structural difference, avoids "copied layout" concern directly.
- Avoided animate-on-every-scroll (counters fire once), avoided hover-lift-on-every-card cliché (only the carousel gets a hover treatment, tab/package cards use crossfade/filter instead — variety of motion, not one repeated micro-interaction everywhere).
- No numbered 01/02/03 markers, no all-caps eyebrow labels, no arrow-glyph CTAs.
- Kept a genuine vertical rhythm change (horizontal-scroll carousel breaks the all-vertical monotony) instead of just alternating image sides.
