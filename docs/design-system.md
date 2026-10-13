# CrownLeaf Design System Specification

This document defines the official design system, visual identity, tokens, and UI standards for the **CrownLeaf** Headless Next.js storefront. It preserves the colors and typography from the live site (`crownleaf.co`) while refining the UI into an executive, high-end corporate gifting atelier distinct from generic retail stores (e.g., BoxUp Gifting).

---

## 1. Brand Philosophy & Aesthetic Direction

### Brand Persona
* **Industry**: Premium Corporate Gifting, VIP Client Hampers, and Employee Welcome Solutions.
* **Tone**: Prestigious, refined, reliable, and bespoke.
* **Core Difference vs. Generic B2C (e.g., BoxUp Gifting)**:
  * BoxUp Gifting is a consumer-focused, pastel-toned Shopify retail store with retail discount tags and casual rounded elements.
  * **CrownLeaf is an executive corporate gifting partner**: Clean architectural layouts, heritage green and brass-gold tones, generous white space, and corporate quotation triggers.

---

## 2. Color Palette & Token Hierarchy

All core colors are extracted directly from the live `crownleaf.co` production stylesheets.

### 2.1 Primary & Accent Palette

| Token Name | Hex Code | RGB | Role & Usage |
| :--- | :--- | :--- | :--- |
| **`crown-green`** *(Brand Primary)* | `#003108` | `rgb(0, 49, 8)` | Top announcement bar, primary brand headings, high-contrast buttons, footer. |
| **`crown-green-dark`** | `#002205` | `rgb(0, 34, 5)` | Button hover states, deep shadow overlays. |
| **`crown-gold`** *(Signature Accent)* | `#A67D44` | `rgb(166, 125, 68)` | Call-to-action buttons, active navigation markers, category tags, badges. |
| **`crown-gold-hover`** | `#8E6935` | `rgb(142, 105, 53)` | Hover state for gold buttons and interactive elements. |
| **`crown-cream`** *(Header & Surfaces)* | `#EFE8E0` | `rgb(239, 232, 224)` | Desktop and mobile header background, subtle callout section backgrounds. |
| **`crown-border`** *(Warm Border)* | `#D1B2B2` | `rgb(209, 178, 178)` | Header bottom divider, refined borders that avoid sterile tech-grey. |

---

### 2.2 Background & Canvas Surfaces

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| **`canvas-base`** | `#FAF8F5` | Main body background. Warm studio off-white that feels tactile and premium. |
| **`surface-white`** | `#FFFFFF` | Product cards, modal dialogs, flyout drawers, dropdowns. |
| **`surface-subtle`** | `#F3EFEA` | Secondary container backgrounds, input field backgrounds. |

---

### 2.3 Functional & Inventory Status Colors

| State | Badge Background | Badge Text | Border | Indicator Dot |
| :--- | :--- | :--- | :--- | :--- |
| **In Stock** | `#ECFDF5` *(Emerald-50)* | `#065F46` *(Emerald-800)* | `#A7F3D0` *(Emerald-200)* | `#10B981` *(Emerald-500)* |
| **Out of Stock** | `#F5F5F4` *(Stone-100)* | `#57534E` *(Stone-600)* | `#E7E5E4` *(Stone-200)* | `#A8A29E` *(Stone-400)* |
| **Custom Branding** | `#FEF3C7` *(Amber-100)* | `#92400E` *(Amber-800)* | `#FDE68A` *(Amber-200)* | `#F59E0B` *(Amber-500)* |

---

## 3. Typography System (`Montserrat`)

CrownLeaf exclusively uses **`Montserrat`** across all interfaces, matching the live WordPress theme typography.

### 3.1 Font Weights & Use Cases
* **Weight 400 (Regular)**: Body paragraphs, product descriptions, secondary meta text.
* **Weight 500 (Medium)**: Subtitles, filter pills, table data, form labels.
* **Weight 600 (SemiBold)**: Primary navigation links, button text, card titles, pricing.
* **Weight 700 (Bold)**: Section titles (`H2`), Hero subheadings.
* **Weight 800 (ExtraBold / Black)**: Main Brand Logo (`CROWNLEAF`), Hero primary display header.

### 3.2 Typography Scale

| Level | Size | Weight | Line Height | Tracking (Letter Spacing) | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `44px` / `2.75rem` | 700 / 800 | `1.15` | `-0.02em` | Homepage Hero heading |
| **Section H2** | `32px` / `2rem` | 700 | `1.25` | `-0.01em` | Catalog headers, feature section titles |
| **Card H3** | `18px` / `1.125rem` | 600 | `1.35` | `normal` | Product card titles, modal titles |
| **Body Large** | `16px` / `1rem` | 400 / 500 | `1.6` | `normal` | Hero intro paragraphs, lead text |
| **Body Base** | `14px` / `0.875rem` | 400 | `1.5` | `normal` | Product descriptions, form text, table cells |
| **Eyebrow / Tag**| `11px` / `0.6875rem` | 700 | `1.4` | `+0.15em` | Category tags, uppercase status labels |
| **Nav Links** | `13px` / `0.8125rem` | 600 | `1.5` | `+0.08em` | Primary header menu (all uppercase) |

---

## 4. Layout, Spacing & Container Grid

* **Max Page Width**: `1300px` (matches `.product-grid` from live `crownleaf.co`).
* **Grid Breakpoints**:
  * **Desktop (`≥ 1024px`)**: 3-column product catalog (`repeat(3, 1fr)`) with `30px` gaps.
  * **Tablet (`768px – 1023px`)**: 2-column grid (`repeat(2, 1fr)`) with `20px` gaps.
  * **Mobile (`< 768px`)**: 1-column stack with `16px` gaps.
* **Section Vertical Rhythm**:
  * Desktop Sections: `80px` padding top & bottom (`py-20`).
  * Mobile Sections: `48px` padding top & bottom (`py-12`).

---

## 5. Component Design Specifications

### 5.1 Product Showcase Card
Unlike flat consumer e-commerce cards, CrownLeaf cards act as bespoke presentation pedestals:
* **Container**:
  * Background: Pure white (`#FFFFFF`).
  * Corner Radius: `16px` (`rounded-2xl`).
  * Border: `1px solid rgba(226, 217, 207, 0.8)`.
  * Shadow: Subtle ambient elevation (`box-shadow: 0 4px 20px -2px rgba(0, 49, 8, 0.05)`).
  * Hover Transition: Subtle vertical lift (`translate-y: -4px`) with soft deeper shadow.
* **Image Stage**:
  * Aspect Ratio: `4:3` or `1:1`.
  * Background: Soft studio tint (`#FAF8F5`).
  * Object Fit: `object-contain` with `16px` inner padding (products must never touch card borders).
* **Card Metadata**:
  * Category eyebrow in gold (`#A67D44`, `11px`, uppercase, tracking wide).
  * Product Title: Deep green (`#003108`, `18px`, semibold, max 2 lines truncated).
  * Price: Displayed clearly as `₹{price}` in bold semibold format.

---

### 5.2 Button System

| Variant | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Green** | `#003108` | `#FFFFFF` | None | Primary actions, "View Details", Form submissions |
| **Crown Gold CTA** | `#A67D44` | `#FFFFFF` | None | "Request Bulk Quote", Header CTA, VIP callouts |
| **Outline Elegance** | Transparent | `#003108` | `1px solid #003108` | Secondary filter triggers, "Quick View" |
| **Minimalist Pill** | `#EFE8E0` | `#003108` | `1px solid #D1B2B2` | Category filters, specification tags |

* **Button Geometry**:
  * CTAs & Filter Badges: Fully rounded pills (`rounded-full`, `px-6 py-2.5`).
  * Form & Card Buttons: Gentle rounded rectangle (`rounded-lg`, `px-4 py-2`).

---

### 5.3 Filter & Category Pill Strip
* Sticky or inline horizontal scrollable pill bar on category pages.
* **Active State**: Background `#003108`, text `#FFFFFF`, font-semibold.
* **Inactive State**: Background `#EFE8E0` or `#F3EFEA`, text `#003108`, hover background `#E2D9CF`.
* Includes product count badge for immediate inventory clarity: e.g., `Drinkware (18)`.

---

### 5.4 Dual-Tone Header Structure
CrownLeaf’s signature dual-tone header creates brand authority immediately:
1. **Tier 1 (Top Bar)**:
   * Height: `36px` to `40px`.
   * Background: Deep Forest Green (`#003108`).
   * Content: Crisp white text with live bulk order phone numbers and corporate dispatch status.
2. **Tier 2 (Main Header)**:
   * Height: `80px` (desktop), `68px` (mobile).
   * Background: Warm Sand Cream (`#EFE8E0`).
   * Border Bottom: `1px solid #D1B2B2`.
   * Logo: CrownLeaf logomark with `#A67D44` corporate gifting subline.
   * Navigation: Uppercase Montserrat links with gold underline hover transitions.

---

## 6. Visual Comparison: CrownLeaf vs. BoxUp Gifting

| Design Feature | BoxUp Gifting (B2C Retail) | CrownLeaf (Executive B2B Gifting) |
| :--- | :--- | :--- |
| **Primary Theme** | Pastel, blush pinks & soft retail neutrals | **Forest Green (`#003108`) & Brass Gold (`#A67D44`)** |
| **Header Style** | Standard white Shopify consumer bar | **Signature Dual-Tone (Deep Green Top + Sand Cream Nav)** |
| **Card Style** | Flat borderless retail product cards | **Framed Showcase Cards with studio padding** |
| **Typography** | Poppins (consumer casual) | **Montserrat (formal, authoritative, executive)** |
| **Primary Conversion** | Retail Add-to-Cart & Gift-Box Builder | **Bulk Corporate Quote & Verified Inventory Inquiries** |
| **Stock Display** | Hidden or standard retail badges | **Minimalist Executive Stock Pills (`In Stock`, `Sold Out`)** |

---

## 7. Tailwind Token Implementation Mapping

When implementing in Tailwind CSS (`app/globals.css` / `lib/theme.js`):

```css
@theme {
  --color-crown-green: #003108;
  --color-crown-green-dark: #002205;
  --color-crown-gold: #A67D44;
  --color-crown-gold-hover: #8E6935;
  --color-crown-cream: #EFE8E0;
  --color-crown-border: #D1B2B2;
  --color-crown-canvas: #FAF8F5;

  --font-montserrat: "Montserrat", sans-serif;
}
```
