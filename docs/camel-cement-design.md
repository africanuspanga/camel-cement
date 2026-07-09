# Camel Cement Website Design System

**Version:** 1.0  
**Date:** 9 July 2026  
**Platform:** Camel Cement public website, customer tools, AI assistant and administration dashboard  
**Frontend:** Next.js 16.2, TypeScript, App Router  
**Backend:** Supabase Auth, Postgres, Storage and Row Level Security

---

## 1. Purpose

This document defines the visual and interaction system for the Camel Cement digital platform.

The website must feel like a leading Tanzanian industrial brand, not a generic construction template. It should communicate:

- Strength
- Reliability
- Technical confidence
- Modern manufacturing
- Nationwide accessibility
- Practical customer support
- Trust backed by Amsons Group

The public experience should help visitors understand products, choose a cement grade, estimate quantities, find a dealer, request a quotation, access technical documents, apply for jobs and get support from the Camel AI assistant.

The administration dashboard should feel efficient, controlled and enterprise-ready. It must help Camel Cement teams manage content, products, dealers, quotations, calculator rules, news, careers, AI knowledge and reporting.

---

## 2. Brand Foundation

### Brand name

**Camel Cement**

### Brand relationship

**A member of Amsons Group**

### Brand line

**We Build Stronger**

### Core visual assets

- Official Camel Cement logo
- Official Amsons Group logo
- Combined Camel Cement and Amsons Group lockup
- Yellow camel icon for the floating AI assistant
- Four product bag variants
- Certification and recognition badges supplied by Camel Cement

### Brand personality

Camel Cement should feel:

- Strong, never aggressive
- Technical, never confusing
- Premium, never decorative
- Practical, never cold
- Established, never outdated
- Modern, never experimental

---

## 3. Visual Theme and Atmosphere

The visual direction is **modern industrial confidence**.

The interface should combine the strength of concrete and engineering with the warmth of Camel Cement's yellow camel and the credibility of Amsons Group green.

The primary page rhythm should be:

**Warm concrete canvas → White content surface → Deep green feature band → Warm neutral utility section → Dark green footer**

Use large construction photography, clear typography, controlled green surfaces and yellow highlights. The design must not look like a hardware shop, an agricultural website or a generic green corporate template.

### Key characteristics

- Large editorial photography showing real construction, cement products, factories, engineers and Tanzanian projects
- Strong product-first layouts
- Warm concrete-inspired neutral surfaces instead of cold gray pages
- Green used for trust, navigation and primary actions
- Yellow used for emphasis, active states, AI assistance and important highlights
- Deep green used for premium feature bands, footer and dashboard navigation
- Product grade colors used only to identify individual cement products
- Rounded but disciplined geometry
- Generous spacing and strong content hierarchy
- Subtle motion, never flashy animation
- High readability on mobile devices and low-bandwidth connections

---

## 4. Color System

The two supplied greens are extremely close. They should have separate roles instead of being placed next to each other as contrasting colors.

### 4.1 Core brand colors

| Token | Hex | Role |
|---|---:|---|
| `camel-green-primary` | `#00872C` | Primary brand green, buttons, links, active states, section headings |
| `camel-green-secondary` | `#008519` | Secondary brand green, hover states, data visualization and supporting accents |
| `camel-yellow` | `#FFAC00` | Camel icon color, emphasis, active indicators and high-attention accents |
| `camel-black` | `#171717` | Logo-compatible black, high-emphasis headings and icons |
| `camel-white` | `#FFFFFF` | Primary card, modal and content surface |

### 4.2 Derived green scale

| Token | Hex | Role |
|---|---:|---|
| `green-950` | `#003A14` | Maximum-depth surfaces, footer bottom strip |
| `green-900` | `#004D1A` | Footer, dashboard sidebar, dark hero band |
| `green-800` | `#005E20` | Hover on deep surfaces, dark cards |
| `green-700` | `#00872C` | Official primary green |
| `green-600` | `#008519` | Official secondary green |
| `green-200` | `#A9DFC0` | Borders, chart fills and soft badges |
| `green-100` | `#D7F0E0` | Success backgrounds and light feature surfaces |
| `green-50` | `#ECF8F0` | Pale brand wash |

### 4.3 Yellow scale

| Token | Hex | Role |
|---|---:|---|
| `yellow-700` | `#B97800` | Dark yellow for outlines and small text on light surfaces |
| `yellow-600` | `#D99000` | Hover state for yellow controls |
| `yellow-500` | `#FFAC00` | Main camel yellow |
| `yellow-200` | `#FFD978` | Soft chart and badge accent |
| `yellow-100` | `#FFE9AD` | Notification and informational surface |
| `yellow-50` | `#FFF8E5` | Light yellow wash |

Yellow buttons must use black or deep green text. White text on yellow does not meet contrast requirements.

### 4.4 Concrete neutral scale

| Token | Hex | Role |
|---|---:|---|
| `concrete-950` | `#20231F` | High-emphasis dark text |
| `concrete-800` | `#3F443F` | Body text |
| `concrete-600` | `#6B716C` | Secondary text |
| `concrete-400` | `#AEB4AF` | Disabled labels and borders |
| `concrete-300` | `#D1D5D2` | Input borders and separators |
| `concrete-200` | `#E4E6E3` | Soft borders |
| `concrete-100` | `#F1F2EF` | Utility backgrounds |
| `concrete-50` | `#F8F7F2` | Main page canvas |

### 4.5 Product identification colors

These colors are for product identity only. They must not replace the main brand colors across the website.

| Product | Token | Hex | Use |
|---|---|---:|---|
| Camel Cement 32.5N | `product-325n` | `#008519` | Product badge, card stripe, comparison table |
| Camel Cement 32.5R | `product-325r` | `#C82D32` | Product badge, card stripe, comparison table |
| Camel Cement 42.5N | `product-425n` | `#20242A` | Product badge, card stripe, comparison table |
| Camel Cement 42.5R | `product-425r` | `#6E2638` | Product badge, card stripe, comparison table |

### 4.6 Semantic colors

| State | Hex | Use |
|---|---:|---|
| Success | `#00872C` | Confirmation and completed states |
| Warning | `#B97800` | Attention, expiring documents and pending review |
| Error | `#C62828` | Invalid fields, destructive actions and failures |
| Information | `#1769AA` | Neutral information and system notices |

### 4.7 Text colors

- Primary text: `#20231F`
- Secondary text: `#5F665F`
- Muted text: `#7A817B`
- Text on dark green: `#FFFFFF`
- Secondary text on dark green: `rgba(255,255,255,0.76)`
- Disabled text: `#A3A8A4`

### 4.8 Color usage rules

Do:

- Use green as the primary action and navigation color
- Use yellow to attract attention to selected, active or AI-related moments
- Use warm neutral surfaces to make green and yellow feel premium
- Use deep green for strong feature sections and the footer
- Use product colors only in product-related components

Do not:

- Use both official greens side by side as though they are visibly different
- Use yellow for long body text
- Cover every section in green
- Use bright red outside product identity or semantic errors
- Place green body text on a green-tinted background without checking contrast
- Introduce unrelated blue, purple or orange brand accents

---

## 5. Typography

### 5.1 Font families

**Primary UI font:**

```css
font-family: "Manrope", "Inter", system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

Use **Manrope** as the preferred public-facing font. It feels modern, strong and engineered without becoming cold.

Use **Inter** as the dashboard fallback or as the universal fallback if Manrope is not loaded.

Do not use the logo typeface as body typography. The Camel Cement wordmark remains an image asset.

### 5.2 Type hierarchy

| Role | Desktop | Mobile | Weight | Line height | Tracking |
|---|---:|---:|---:|---:|---:|
| Display XL | 72px | 44px | 700 | 1.02 | `-0.035em` |
| Display | 56px | 38px | 700 | 1.06 | `-0.03em` |
| H1 | 48px | 34px | 700 | 1.1 | `-0.025em` |
| H2 | 38px | 30px | 700 | 1.15 | `-0.02em` |
| H3 | 28px | 24px | 700 | 1.2 | `-0.015em` |
| H4 | 22px | 20px | 650 | 1.25 | `-0.01em` |
| Lead | 20px | 18px | 400 | 1.65 | `-0.005em` |
| Body | 16px | 16px | 400 | 1.65 | `0` |
| Small | 14px | 14px | 400 | 1.5 | `0` |
| Label | 13px | 13px | 650 | 1.3 | `0.02em` |
| Eyebrow | 12px | 12px | 700 | 1.3 | `0.1em` |

### 5.3 Typography principles

- Headings should feel strong and compact
- Body copy should remain comfortable and open
- Do not use all caps for full headings
- All caps are reserved for short eyebrows, product grades and small status labels
- Use sentence case for buttons
- Keep body paragraphs below 75 characters per line
- Use tabular numerals for prices, quantities, analytics and calculator results
- Never render technical specifications in light gray text

### 5.4 Recommended utility classes

```css
.text-display-xl { font-size: clamp(2.75rem, 6vw, 4.5rem); line-height: 1.02; }
.text-display { font-size: clamp(2.375rem, 5vw, 3.5rem); line-height: 1.06; }
.text-h1 { font-size: clamp(2.125rem, 4vw, 3rem); line-height: 1.1; }
.text-h2 { font-size: clamp(1.875rem, 3vw, 2.375rem); line-height: 1.15; }
.text-body { font-size: 1rem; line-height: 1.65; }
```

---

## 6. Spacing System

Use a 4px base unit.

| Token | Value | Typical use |
|---|---:|---|
| `space-1` | 4px | Icon alignment, tiny gaps |
| `space-2` | 8px | Label gaps, inline controls |
| `space-3` | 12px | Compact card spacing |
| `space-4` | 16px | Default component padding |
| `space-5` | 20px | Form groups |
| `space-6` | 24px | Card padding, content grouping |
| `space-8` | 32px | Large card padding |
| `space-10` | 40px | Section inner gaps |
| `space-12` | 48px | Mobile section padding |
| `space-16` | 64px | Desktop section padding |
| `space-20` | 80px | Large page transitions |
| `space-24` | 96px | Premium hero spacing |

### Section spacing

- Mobile vertical section padding: 48px to 64px
- Tablet vertical section padding: 64px to 80px
- Desktop vertical section padding: 80px to 112px
- Public page max width: 1440px
- Reading content max width: 760px
- Dashboard content max width: none, use responsive fluid layout

---

## 7. Grid and Layout

### 7.1 Public website container

```css
width: min(100% - 32px, 1280px);
margin-inline: auto;
```

At desktop, allow selected visual sections to extend to 1440px.

### 7.2 Grid rules

- 12-column grid on desktop
- 8-column grid on tablet
- 4-column grid on mobile
- Desktop gutter: 24px
- Tablet gutter: 20px
- Mobile gutter: 16px

### 7.3 Common layouts

- Hero: 6/6 or 7/5 split
- Product section: 4 cards at large desktop, 2 cards on tablet, 1 card on mobile
- News: 3 cards desktop, 2 tablet, 1 mobile
- Dashboard summary cards: 4 desktop, 2 tablet, 1 mobile
- Form layouts: 2 columns desktop, 1 column mobile
- Product detail: 5/7 split for image and content

---

## 8. Radius and Geometry

The interface should feel approachable but industrial. Avoid overly soft, playful shapes.

| Token | Value | Use |
|---|---:|---|
| `radius-sm` | 8px | Inputs, small badges |
| `radius-md` | 12px | Standard cards and dropdowns |
| `radius-lg` | 18px | Large product cards, feature panels |
| `radius-xl` | 24px | Hero media, calculator panel |
| `radius-pill` | 999px | Buttons, filters and statuses |
| `radius-round` | 50% | AI button and circular icons |

Do not use more than 24px radius on large desktop cards.

---

## 9. Depth and Elevation

Use restrained layered shadows.

| Level | Shadow | Use |
|---|---|---|
| Surface | `0 1px 2px rgba(20,31,23,0.05)` | Inputs and flat cards |
| Card | `0 8px 24px rgba(20,31,23,0.08)` | Product and content cards |
| Raised | `0 16px 40px rgba(20,31,23,0.12)` | Dropdowns, popovers and sticky panels |
| Modal | `0 28px 80px rgba(7,25,13,0.22)` | Dialogs and product quick views |
| Floating AI | `0 10px 24px rgba(0,77,26,0.24), 0 2px 8px rgba(0,0,0,0.16)` | Camel AI button |

### Elevation rules

- Use borders before shadows for dashboard surfaces
- Avoid heavy black shadows
- Increase elevation only when an element visually overlaps another surface
- Product images can use a soft ground shadow to feel physical

---

## 10. Motion and Interaction

### Timing tokens

| Token | Value | Use |
|---|---:|---|
| `motion-fast` | 140ms | Hover and press feedback |
| `motion-base` | 220ms | Buttons, cards and tabs |
| `motion-slow` | 340ms | Drawers, accordions and modals |

### Easing

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0, 0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

### Motion rules

- Buttons press to `scale(0.97)`
- Cards may lift by `translateY(-3px)` on hover
- Images fade in over 300ms
- Accordions use height and opacity transitions
- Modal content may translate upward by 12px while fading in
- Respect `prefers-reduced-motion`
- Do not animate large background gradients or use continuous parallax

---

## 11. Buttons

All primary buttons must have a minimum height of 48px.

### 11.1 Primary green button

```css
background: #00872C;
color: #FFFFFF;
border: 1px solid #00872C;
border-radius: 999px;
min-height: 48px;
padding: 0 22px;
font-weight: 700;
```

Hover:

```css
background: #006F25;
border-color: #006F25;
transform: translateY(-1px);
```

Use for:

- Request a Quote
- Explore Products
- Submit Application
- Save Changes
- Continue

### 11.2 Yellow emphasis button

```css
background: #FFAC00;
color: #171717;
border: 1px solid #FFAC00;
```

Use sparingly for:

- Calculate My Cement
- Start AI Assistance
- Active product selection
- Important conversion moments on dark green sections

### 11.3 Green outline button

```css
background: transparent;
color: #00872C;
border: 1.5px solid #00872C;
```

Use for:

- View Details
- Download Datasheet
- Compare Products
- Secondary actions

### 11.4 Dark-surface white button

```css
background: #FFFFFF;
color: #005E20;
border: 1px solid #FFFFFF;
```

Use on deep green sections.

### 11.5 Ghost button

```css
background: transparent;
color: #20231F;
border: 1px solid transparent;
```

Use for tertiary actions and dashboard controls.

### 11.6 Destructive button

```css
background: #C62828;
color: #FFFFFF;
```

Require confirmation for destructive dashboard actions.

---

## 12. Global Navigation

### Desktop header

- Height: 84px
- Position: sticky at top
- Background: `rgba(255,255,255,0.94)`
- Backdrop blur: 16px
- Bottom border: `1px solid #E4E6E3`
- Maximum content width: 1280px

### Header composition

Left:

- Combined Camel Cement and Amsons Group logo lockup

Center:

- About
- Products
- Calculator
- Quality
- Projects
- Resources
- News

Right:

- Find a Dealer
- Request a Quote button
- Language selector

### Mobile header

- Height: 68px
- Camel Cement logo on the left
- Search and menu icons on the right
- Full-height drawer navigation
- Request a Quote button pinned near the bottom of the drawer

### Announcement bar

Optional 32px to 40px top bar.

Use for:

- Sales contact
- Certification message
- Major corporate announcement
- Service availability

Recommended surface:

```css
background: #004D1A;
color: #FFFFFF;
```

---

## 13. Hero Sections

### Public homepage hero

The hero must immediately communicate the brand, the product and the next action.

Recommended layout:

- Left: headline, supporting text and CTAs
- Right: premium photography of Camel Cement bags or a Tanzanian construction project
- Optional trust badge row below CTAs

### Suggested hero content structure

```text
Eyebrow: Built for Tanzania
Heading: Strong foundations begin with the right cement
Body: Dependable cement products for homes, commercial developments and major infrastructure.
Primary CTA: Explore Products
Secondary CTA: Calculate Your Cement
```

### Hero styling

- Background: `#F8F7F2`
- Optional image overlay: deep green at 20% to 45%
- Hero media radius: 24px
- Main heading uses `concrete-950`
- Green should appear in one phrase or eyebrow, not every word
- Yellow can be used as a short underline, icon or active badge

### Dark green hero variant

Use for product pages, quality, sustainability or campaigns.

- Background: `#004D1A`
- Text: white
- Accent: yellow
- Secondary copy: 76% white

---

## 14. Trust and Certification Components

### Trust strip

Display selected verified credentials in a horizontal or responsive grid.

Examples:

- ISO 9001:2015
- TBS certification
- SGS certification
- Superbrands recognition
- EN 197 compliance

### Card specification

- White surface
- 12px radius
- 1px concrete border
- Logo or icon centered
- One short sentence explaining the credential
- Optional certificate download link

Do not display low-resolution certification images. Use approved SVG or high-resolution transparent PNG assets.

---

## 15. Product Cards

Each product card must be useful before the user opens the detail page.

### Required content

- Product bag image
- Product grade
- Friendly product name
- One-sentence description
- Three recommended applications
- Bag size
- Product-specific color indicator
- View Details
- Calculate Quantity
- Request Quote or Add to Order

### Card styling

```css
background: #FFFFFF;
border: 1px solid #E4E6E3;
border-radius: 18px;
overflow: hidden;
box-shadow: 0 8px 24px rgba(20,31,23,0.08);
```

### Product identity strip

Use a 6px top edge or small grade badge in the assigned product color.

Do not fill the entire card with product red, black, green or maroon.

### Hover state

- Card lifts by 3px
- Product image scales to 1.025
- Border changes to a light green
- Primary action becomes more visible

---

## 16. Product Quick View and Product Detail

### Quick view modal

Use quick view for fast exploration, not as the only product destination.

Required layout:

- Product image
- Product name and grade
- Main benefits
- Recommended uses
- Available bag size
- Download datasheet
- Calculate quantity
- Request quotation
- Link to full product page

### Product detail page

The product detail page must include:

1. Breadcrumb
2. Product image and technical grade
3. Summary and key benefits
4. Application list
5. Technical specifications
6. Storage and handling information
7. Quality and certification information
8. Downloadable documents
9. Calculator entry
10. Dealer and quotation actions
11. Related products

### Tabs

Recommended tabs:

- Overview
- Applications
- Technical Data
- Documents
- Storage and Safety

Tabs become an accordion on mobile.

---

## 17. Product Comparison

Allow users to compare up to three cement grades.

### Comparison table rules

- Sticky first column on desktop
- Horizontal scroll on small screens
- Product color appears only in grade badges
- Green check icon for supported applications
- Dash for not recommended
- Add a clear disclaimer that project specifications must be confirmed by a qualified professional

### Important comparison rows

- Cement classification
- Strength grade
- Early strength behavior
- Typical use cases
- Bag size
- Technical documents
- Request quote action

---

## 18. Material Estimator and Construction Calculator

The calculator is a flagship product feature.

### Calculator types

- Concrete slab
- Foundation
- Column
- Beam
- Block laying
- Brick laying
- Wall plastering
- Floor screed
- Paving
- General concrete volume

### Desktop layout

- Left: step navigation and inputs
- Right: sticky live estimate card

### Mobile layout

- One step per screen or compact accordion
- Sticky bottom Continue button
- Results appear as a full-width summary panel

### Input styling

- 52px minimum height
- 12px radius
- Visible label above input
- Unit selector integrated on the right
- Help text below when needed
- Green focus ring

### Result card

Use a high-contrast result surface.

Recommended styling:

```css
background: #004D1A;
color: #FFFFFF;
border-radius: 24px;
padding: 28px;
```

Highlight estimated cement bags using yellow.

Example:

```text
Estimated requirement
126 bags
Recommended product: Camel Cement 42.5N
```

### Result actions

- Request a Quote
- Save as PDF
- Send to WhatsApp
- Email Estimate
- Find a Dealer

### Disclaimer

Display the disclaimer directly under the result, not hidden in a tooltip.

---

## 19. Forms and Inputs

### Input field

```css
height: 52px;
border: 1px solid #D1D5D2;
border-radius: 12px;
background: #FFFFFF;
padding: 0 14px;
font-size: 16px;
```

Focus:

```css
border-color: #00872C;
box-shadow: 0 0 0 4px rgba(0,135,44,0.12);
```

### Labels

- Always visible
- 14px, weight 650
- Primary text color
- Required marker in red, not yellow

### Textarea

- Minimum height: 132px
- Vertical resize allowed

### Select and combobox

- Searchable for long lists such as regions, districts, dealers and products
- Keyboard accessible
- Show selected value clearly

### Validation

- Error text appears below the field
- Error icon is optional
- Do not use color as the only indicator
- Preserve user input after submission errors

### File upload

Use for careers and technical document administration.

- Drag and drop area
- Clear file type and size rules
- Upload progress
- Remove or replace action
- Virus scanning status in dashboard workflows

---

## 20. Quotation Flow

The quotation flow should feel shorter than a long corporate form.

### Recommended steps

1. Customer type
2. Product and quantity
3. Project and location
4. Delivery or collection
5. Contact details
6. Review and submit

### Stepper

- Active step: primary green
- Completed step: green circle with check
- Future steps: concrete gray
- Mobile: compact progress label such as `Step 2 of 6`

### Confirmation

After submission show:

- Reference number
- Summary
- Expected next action
- Contact options
- Download or email copy

---

## 21. Dealer Locator

### Main components

- Search field
- Region filter
- District filter
- Product filter
- Map
- Dealer result list
- Dealer details drawer

### Dealer card

Include:

- Dealer name
- Authorised status
- Address
- Distance
- Phone
- Directions
- Available products if confirmed
- Request availability

### Map styling

- Use brand green markers
- Selected marker becomes yellow with deep green outline
- Avoid excessive custom map decoration
- Provide a list alternative for accessibility

---

## 22. News and Insights

### Article card

- 16:10 image
- Category eyebrow
- Headline
- Short excerpt
- Reading time
- Publication date
- Read article link

### Launch categories

- Building Guides
- Cement Education
- Concrete Best Practice
- Company News
- Projects
- Sustainability and CSR

### Article page

- Reading width: 720px to 760px
- Sticky share tools on desktop
- Related products only when relevant
- Clear author, date and reading time
- No decorative sidebars that distract from reading

---

## 23. Resources and Downloads

### Resource card

Include:

- File type icon
- Title
- Category
- Product association
- File size
- Version or publication date
- Download action

### Filters

- Product
- Document type
- Language
- Year

### Document types

- Technical datasheets
- Product brochures
- Certificates
- Safety documents
- Company profile
- Construction guides
- Sustainability reports

---

## 24. Projects and Case Studies

### Project card

- Large project image
- Project name
- Location
- Category
- Camel Cement product used
- Short result statement

### Project detail

- Full-width hero image
- Project overview
- Scope
- Product used
- Gallery
- Partner or contractor information when approved
- Quote from project stakeholder when approved

Use authentic Tanzania-based imagery wherever possible.

---

## 25. Careers

### Vacancy card

- Job title
- Department
- Location
- Employment type
- Closing date
- View and Apply actions

### Application flow

- Personal details
- Professional details
- CV upload
- Supporting documents
- Consent
- Review and submit

### Status colors in dashboard

- New: blue information
- Reviewing: yellow warning
- Shortlisted: green
- Rejected: neutral red tint
- Hired: deep green

---

## 26. Camel AI Assistant

The floating AI assistant is a signature interaction element.

### Floating button

- Size: 60px desktop, 56px mobile
- Position: bottom-right
- Desktop offset: 28px
- Mobile offset: 18px
- Background: `#FFAC00`
- Icon: official black-outlined yellow camel icon or simplified black camel silhouette
- Border: `2px solid #FFFFFF`
- Shadow: floating AI shadow token
- Tooltip: `Ask Camel`

### Hover and active state

- Hover: scale to 1.04
- Active: scale to 0.96
- Display a small green online indicator
- Do not use pulsing animation continuously

### Chat panel

Desktop:

- Width: 400px
- Height: min(680px, 78vh)
- Radius: 20px
- Header: deep green
- Background: white

Mobile:

- Full-screen sheet
- Safe-area support
- Sticky composer at bottom

### Chat header

- Camel icon
- `Camel Build Assistant`
- Status: `Online 24/7`
- Human support handoff
- Close button

### Message styling

Assistant message:

- Background: `#F1F2EF`
- Text: primary text
- Radius: 14px 14px 14px 4px

Customer message:

- Background: `#00872C`
- Text: white
- Radius: 14px 14px 4px 14px

### Suggested actions

- Help me choose cement
- Calculate cement bags
- Find a dealer
- Request a quotation
- Download a product sheet

### Safety and trust

- Show when an answer is based on a technical document
- Provide a visible engineering disclaimer for structural advice
- Never display private customer or internal company data
- Escalate uncertain technical questions to staff

---

## 27. Modals, Drawers and Popovers

### Modal

- Max width: 720px standard
- Product quick view: up to 980px
- Radius: 20px
- Background: white
- Overlay: `rgba(0,20,7,0.62)`
- Close button: 44px touch target

### Drawer

Use for:

- Mobile navigation
- Filters
- Dealer detail
- Cart or order request
- Dashboard mobile side navigation

### Popover

Use for small actions only:

- Profile menu
- Language selection
- Date filters
- Table column controls

Do not use a popover for important legal, technical or purchase information.

---

## 28. Tables and Data Display

### Public tables

- Use clear row spacing
- Avoid dense enterprise styling
- Keep the first column strong
- Allow horizontal scrolling
- Include download or print option when useful

### Dashboard tables

- 48px row height minimum
- Sticky header for long lists
- Search, filters and saved views
- Checkbox selection
- Bulk actions
- Sort indicators
- Pagination or cursor loading
- Empty, loading and error states

### Status badges

```css
border-radius: 999px;
padding: 5px 10px;
font-size: 12px;
font-weight: 700;
```

Use light tinted backgrounds with dark readable text.

---

## 29. Administration Dashboard

The dashboard should be light-first, efficient and calm.

### Dashboard shell

Desktop:

- Left sidebar: 272px
- Top header: 72px
- Main content: fluid
- Background: `#F1F2EF`

Sidebar:

- Background: `#004D1A`
- White logo lockup
- White navigation labels
- Active item: yellow-tinted surface or yellow left indicator

### Main dashboard navigation

- Overview
- Products
- Quotations
- Orders
- Calculator
- Dealers
- Content
- News
- Projects
- Resources
- Quality and Certificates
- Sustainability and CSR
- Careers
- AI Assistant
- Media
- Analytics
- Users and Roles
- Settings
- Audit Logs

### Dashboard page header

Include:

- Breadcrumb
- Page title
- Supporting description
- Primary action
- Optional date range or filter controls

### KPI cards

Use a clean 4-up grid.

Required elements:

- Label
- Main value
- Trend
- Comparison period
- Small icon
- Optional sparkline

Do not use multiple bright colors. Use green for positive, red for negative and yellow for pending.

### Charts

Preferred chart colors:

1. `#00872C`
2. `#FFAC00`
3. `#005E20`
4. `#A9DFC0`
5. `#6B716C`
6. Product-specific colors only for product charts

Charts should include tooltips, labels and accessible summaries.

### Empty states

Use simple line illustrations or icons.

Example:

```text
No quotation requests yet
New requests will appear here when customers submit the website form.
```

### Dashboard mobile behavior

- Sidebar becomes a drawer
- KPI cards stack
- Tables become card lists when necessary
- Important actions remain accessible in a sticky bottom action area

---

## 30. Image Direction

### Preferred photography

- Real Tanzanian construction projects
- Camel Cement product bags in authentic environments
- Factory, laboratory and dispatch operations
- Engineers, builders, masons and contractors
- Concrete structures and infrastructure
- Dealer and distribution activity
- Community and CSR initiatives

### Image style

- Natural light or controlled industrial lighting
- Realistic color grading
- Strong texture and material detail
- Clear focal subject
- Avoid overly dramatic HDR
- Avoid generic foreign skylines
- Avoid visibly artificial AI-generated people or construction scenes

### Product photography

- Preserve packaging accurately
- Do not alter logos, grade labels or certification marks
- Use transparent product cutouts when available
- Maintain consistent scale and camera angle across product cards

### Overlay rules

- Use deep green overlay between 18% and 48% when text sits on photography
- Never place yellow body text over busy photography
- Use subtle noise or concrete texture at very low opacity, below 4%

---

## 31. Iconography

### Style

- Rounded line icons
- 1.75px to 2px stroke
- Simple geometry
- Minimal internal detail

### Colors

- Default: `#20231F`
- Brand action: `#00872C`
- On dark surfaces: white
- Highlight: `#FFAC00`

### Rules

- Use one icon library consistently
- Recommended: Lucide Icons
- Use custom camel icon only for brand-specific moments
- Do not mix filled, outlined and 3D icons in the same interface

---

## 32. Footer

### Main footer

- Background: `#004D1A`
- Text: white
- Secondary text: 76% white
- Link hover: yellow

### Footer columns

1. Brand and short company statement
2. Products
3. Customer Support
4. Company
5. Resources
6. Contact

### Footer trust area

- Camel Cement and Amsons Group lockup
- Approved certifications
- Social links
- Sales phone
- Sales email
- Factory or office address

### Footer bottom strip

- Background: `#003A14`
- Copyright
- Privacy Policy
- Terms
- Cookie Preferences
- Accessibility

---

## 33. Responsive Behavior

### Breakpoints

| Name | Width | Main changes |
|---|---:|---|
| Small | `< 640px` | Single column, mobile nav, full-width actions |
| Medium | `640px to 767px` | Wider cards, 2-column selected grids |
| Tablet | `768px to 1023px` | Split layouts begin, 2-column product grid |
| Desktop | `1024px to 1439px` | Full navigation, 3 to 4-column grids |
| Large | `1440px+` | Expanded whitespace and maximum content widths |

### Responsive rules

- Minimum touch target: 44px by 44px
- Hero content stacks below 768px
- Product card actions become full-width on small screens
- Tables scroll horizontally or transform into cards
- Sticky side panels become inline sections on mobile
- Modals become full-screen sheets below 640px
- Floating AI button must avoid overlapping cookie notices and mobile bottom navigation
- Images preserve subject focus with explicit object positioning

---

## 34. Accessibility

Target **WCAG 2.2 AA**.

### Required standards

- Full keyboard navigation
- Visible focus indicators
- Skip-to-content link
- Semantic headings
- Form labels connected to fields
- Error summaries for long forms
- Alternative text for meaningful images
- Empty alt text for decorative images
- Captions or transcripts for video
- Sufficient contrast
- Reduced-motion support
- No color-only communication
- Screen-reader labels for icon buttons
- Accessible dialog focus trapping
- Logical table headers

### Focus ring

```css
outline: 3px solid rgba(255,172,0,0.85);
outline-offset: 3px;
```

On yellow surfaces use a deep green focus ring.

---

## 35. Loading, Empty and Error States

Every dynamic component must have:

- Loading state
- Empty state
- Error state
- Success state
- Offline or retry state where relevant

### Skeletons

- Use concrete-100 and concrete-200
- Preserve final layout dimensions
- Avoid shimmer when reduced motion is enabled

### Toasts

- Bottom-right desktop
- Bottom-center mobile
- Maximum width: 420px
- Auto-dismiss only for low-risk confirmations
- Errors remain until dismissed or resolved

---

## 36. CSS Design Tokens

```css
:root {
  /* Brand */
  --camel-green-primary: #00872c;
  --camel-green-secondary: #008519;
  --camel-green-deep: #004d1a;
  --camel-green-dark: #003a14;
  --camel-yellow: #ffac00;
  --camel-yellow-dark: #d99000;
  --camel-black: #171717;
  --camel-white: #ffffff;

  /* Product identity */
  --product-325n: #008519;
  --product-325r: #c82d32;
  --product-425n: #20242a;
  --product-425r: #6e2638;

  /* Surfaces */
  --surface-page: #f8f7f2;
  --surface-subtle: #f1f2ef;
  --surface-card: #ffffff;
  --surface-dark: #004d1a;

  /* Text */
  --text-primary: #20231f;
  --text-secondary: #5f665f;
  --text-muted: #7a817b;
  --text-inverse: #ffffff;

  /* Borders */
  --border-soft: #e4e6e3;
  --border-default: #d1d5d2;
  --border-strong: #aeb4af;

  /* Semantic */
  --success: #00872c;
  --warning: #b97800;
  --error: #c62828;
  --info: #1769aa;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  /* Shadow */
  --shadow-surface: 0 1px 2px rgba(20, 31, 23, 0.05);
  --shadow-card: 0 8px 24px rgba(20, 31, 23, 0.08);
  --shadow-raised: 0 16px 40px rgba(20, 31, 23, 0.12);
  --shadow-modal: 0 28px 80px rgba(7, 25, 13, 0.22);
  --shadow-ai: 0 10px 24px rgba(0, 77, 26, 0.24),
    0 2px 8px rgba(0, 0, 0, 0.16);

  /* Motion */
  --motion-fast: 140ms;
  --motion-base: 220ms;
  --motion-slow: 340ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 37. Tailwind Theme Reference

```ts
const camelTheme = {
  colors: {
    camel: {
      green: {
        50: "#ECF8F0",
        100: "#D7F0E0",
        200: "#A9DFC0",
        600: "#008519",
        700: "#00872C",
        800: "#005E20",
        900: "#004D1A",
        950: "#003A14",
      },
      yellow: {
        50: "#FFF8E5",
        100: "#FFE9AD",
        200: "#FFD978",
        500: "#FFAC00",
        600: "#D99000",
        700: "#B97800",
      },
      concrete: {
        50: "#F8F7F2",
        100: "#F1F2EF",
        200: "#E4E6E3",
        300: "#D1D5D2",
        400: "#AEB4AF",
        600: "#6B716C",
        800: "#3F443F",
        950: "#20231F",
      },
    },
    product: {
      "325n": "#008519",
      "325r": "#C82D32",
      "425n": "#20242A",
      "425r": "#6E2638",
    },
  },
};
```

---

## 38. Public Website Page Rhythm

Use the following sequence as a default, not as a rigid rule:

1. Announcement bar
2. White sticky navigation
3. Warm-neutral hero
4. Trust and certification strip
5. White product section
6. Deep green calculator or technical feature band
7. Warm-neutral brand or factory story
8. White project or dealer section
9. Light green resource or sustainability section
10. White news section
11. Deep green final call to action
12. Dark green footer

This alternation creates a premium, readable and recognisable rhythm.

---

## 39. Do and Do Not

### Do

- Use the official green and yellow consistently
- Build around product photography and real construction imagery
- Keep sections spacious and purposeful
- Use deep green for high-confidence moments
- Use yellow for focused emphasis and the AI assistant
- Give each product a consistent grade color
- Provide clear actions on every product and calculator screen
- Design public and dashboard experiences as one coherent system
- Keep technical information readable and easy to download
- Validate every responsive state

### Do not

- Copy Starbucks-specific layout, terminology or components
- Use green on every surface
- Use yellow text on white
- Apply product red or maroon as site-wide accent colors
- Use glossy 3D buttons, neon effects or heavy gradients
- Use generic skyline images unrelated to Tanzania
- Hide essential product information inside modals only
- Make the calculator look like a spreadsheet
- Make dashboard tables too dense
- Use tiny text below 14px for essential information
- Use the combined logo at a size where either brand becomes unreadable

---

## 40. Developer Acceptance Checklist

### Brand

- [ ] Official Camel Cement logo is used without distortion
- [ ] Amsons Group relationship is visible but does not overpower Camel Cement
- [ ] Brand green `#00872C` is the primary interface color
- [ ] Secondary green `#008519` is assigned a supporting role
- [ ] Camel yellow `#FFAC00` is used with dark text
- [ ] Product colors match the correct cement grade

### Public website

- [ ] Responsive navigation works on all target breakpoints
- [ ] Product cards contain useful information and actions
- [ ] Each product has a permanent SEO-friendly detail page
- [ ] Quick-view modal is keyboard accessible
- [ ] Calculator is usable on mobile
- [ ] Quote flow preserves partially entered information
- [ ] Dealer locator has a list fallback
- [ ] Documents include file type, size and date
- [ ] Careers application supports secure uploads
- [ ] AI assistant supports English and Kiswahili

### Dashboard

- [ ] Role-based navigation and permissions are visible
- [ ] KPI cards adapt responsively
- [ ] Tables have filters, sorting, empty states and exports
- [ ] Product and content editors include preview states
- [ ] Quote status history is auditable
- [ ] Certificate expiry warnings are visible
- [ ] AI knowledge content can be reviewed and updated
- [ ] All important actions are logged

### Quality

- [ ] WCAG 2.2 AA checks pass
- [ ] Core Web Vitals pass on major pages
- [ ] Images use responsive sizes and modern formats
- [ ] Motion respects reduced-motion preferences
- [ ] API keys are never exposed to the browser
- [ ] Supabase Row Level Security is enabled for sensitive tables
- [ ] Loading, empty, error and success states exist
- [ ] Mobile touch targets are at least 44px

---

## 41. Agent Prompt Guide

Use the following prompts when asking a coding agent to implement the interface.

### Homepage hero

> Build a premium Camel Cement homepage hero using a warm concrete canvas `#F8F7F2`. Use a 7/5 desktop split with strong Manrope typography on the left and authentic Camel Cement product or Tanzanian construction photography on the right. The headline should use `#20231F`, the eyebrow should use `#00872C`, and the primary button should be a 48px-high full-pill in `#00872C` with white text. The secondary calculator button should use `#FFAC00` with black text. Stack the layout below 768px.

### Product card

> Create a Camel Cement product card with a white surface, `18px` radius, `1px solid #E4E6E3` border and `0 8px 24px rgba(20,31,23,0.08)` shadow. Show the product bag, technical grade, customer-friendly name, one-line description, three applications and actions for View Details, Calculate Quantity and Request Quote. Add only a small top strip or badge in the product-specific grade color.

### Calculator

> Build a step-based cement calculator. On desktop use a two-column layout with inputs on the left and a sticky deep-green result card on the right. The result card uses `#004D1A`, white text and a large yellow `#FFAC00` cement-bag estimate. Inputs are 52px high with 12px radius, visible labels and a green focus ring. On mobile show one step at a time with a sticky Continue button.

### AI assistant

> Build a persistent Camel AI floating button using the official camel icon. The button is 60px on desktop and 56px on mobile, filled with `#FFAC00`, outlined in white and positioned bottom-right. It opens a 400px-wide chat panel on desktop and a full-screen sheet on mobile. The header uses `#004D1A`, the customer messages use `#00872C`, and assistant messages use `#F1F2EF`. Include suggested actions for choosing cement, calculating bags, finding a dealer and requesting a quotation.

### Dashboard shell

> Build the Camel Cement administration dashboard with a 272px deep-green `#004D1A` sidebar, a 72px white top bar and a `#F1F2EF` page background. Use white content cards with 12px radius and subtle borders. The active sidebar item should have a yellow indicator. Dashboard tables must include search, filters, sorting, export, empty states and accessible pagination.

### Quote form

> Build a six-step quotation form with a compact progress stepper. Use visible labels, 52px inputs, 12px radius and green focus states. The steps are customer type, product and quantity, project and location, delivery or collection, contact details, and review. On successful submission, show a clear reference number and next actions.

### Dark feature band

> Create a full-width Camel Cement feature band using `#004D1A`. Use white headings, 76% white body copy and a yellow `#FFAC00` primary button with black text. Add authentic factory, product or construction imagery on the opposite side. Use a 6/6 split on desktop and stack on mobile.

### Dealer locator

> Build a dealer locator with region, district and product filters, a map and a synchronised result list. Map markers use `#00872C`; the selected marker uses `#FFAC00` with a deep-green outline. Dealer cards show authorised status, address, phone, directions and availability request actions. Include an accessible list-only experience.

---

## 42. Final Design Principle

Every screen should answer at least one of these customer questions:

1. Which Camel Cement product should I use?
2. How much cement might I need?
3. Where can I buy it?
4. How can I request a quotation?
5. Where can I find verified technical information?
6. How can I speak to Camel Cement?

The design is successful when Camel Cement feels available, dependable and useful at any time of day.
