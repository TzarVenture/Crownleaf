<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CrownLeaf - Antigravity Agent Guidelines & Rules

This document outlines the mandatory development standards, Git workflows, architecture rules, testing protocols, and design constraints for **CrownLeaf**. All AI assistants and developers working on this repository must strictly adhere to these instructions.

---

## 1. Project Overview
* **Brand**: CrownLeaf (crownleaf.co) — India's premier corporate gifting atelier, specializing in bulk corporate gifts, employee welcome hampers, and customized business gifting solutions.
* **Architecture**: Headless E-commerce.
  * **Frontend**: Next.js (App Router) strictly handles user interfaces, page rendering, routing, client state, and SEO.
  * **Backend & CMS**: WordPress with WooCommerce functions as the headless database, inventory manager, stock tracker, and order processing engine.

---

## 2. Detailed Tech Stack
* **Framework**: Next.js 16+ (App Router architecture with React Server Components by default).
* **UI & React**: React 19, JavaScript (Node.js ES Modules).
* **Styling**: Tailwind CSS v4, supplemented with dedicated theme tokens.
* **Backend Integration**: WooCommerce REST API v3 (`@woocommerce/woocommerce-rest-api`).
* **Typography**: Google Fonts `Montserrat` exclusively (loaded via `next/font/google`).
* **Image Optimization**: `next/image` with remote patterns configured for `crownleaf.co`.

---

## 3. Operational & Conversation Protocol (No Unsolicited Changes)
* **Explicit Authorization Required**: Do **NOT** make changes to any code, configurations, or files until the user explicitly instructs you to do so.
* **Discussion & Doubt-Clearing Mode**: When the user is asking questions, clearing doubts, exploring options, or discussing architecture, **strictly respond in text**. Never modify, create, or delete files during conversational or advisory turns.

---

## 4. Git Rules & Commit Protocol
* **Strict Commit Prohibition**: Never execute `git commit` or `git push` automatically after making code changes.
* **Review & Verification Cycle**: Always complete all requested changes, run full verification/builds, and present a clear summary of the work done.
* **Closing Prompt & Contextual Next Steps**: Conclude every turn that introduces code changes by asking if the user would like to commit and push to GitHub, accompanied by the clear, logical next step for the project. For example:
  > *"Would you like to commit and push these changes to GitHub? If ready, the next step is to [Specific Next Task]."*

---

## 5. Feature Branch Workflow (Step-by-Step)
When working with branches, strictly follow this standard 7-step sequence:
1. **Pull Live Main**: Checkout and pull the latest changes: `git checkout main && git pull origin main`.
2. **Create Feature Branch**: Create and switch to a descriptive branch: `git checkout -b feature/<feature-name>`.
3. **Implement Changes**: Perform the coding and structural modifications.
4. **User Review**: Present all changes for user review and approval.
5. **Commit & Push**: Upon explicit user confirmation, commit and push to the feature branch: `git add . && git commit -m "<message>" && git push origin feature/<feature-name>`.
6. **Merge to Main**: Merge the verified feature branch into `main`.
7. **Sync Main**: Pull the updated `main` branch to ensure local and remote synchronization.

---

## 6. Testing, Verification & Code Flow Integrity
* **Zero Error Mandate**: After every modification, test the code completely. Ensure zero compiler errors, zero build failures (`npm run build`), and zero runtime console warnings or unhandled exceptions.
* **Preserve Code Flow**: New code must respect and seamlessly integrate into the existing architecture, file structure, and data flows. Never break existing routes or components.
* **Server Component Safety**: Always ensure server-side data fetches handle potential null/undefined values gracefully without breaking page prerendering.

---

## 7. Centralized Error Handling Standards
* **Reusability First**: Before writing error handling logic, inspect if an existing error utility or handler exists in `lib/` or `components/`. If so, use it.
* **Comprehensive Error Context**: If creating a handler, ensure it captures and exposes actionable, descriptive diagnostics:
  * Distinguish between network timeouts, WooCommerce REST API errors (status codes & messages), and Next.js rendering issues.
  * Always provide graceful UI fallbacks (e.g., "Unable to load inventory. Please try again.") rather than white-screening or crashing.

---

## 8. Dependency & Library Management Rules
* **Explicit Permission Required**: Never install any external package (`npm install <package>`) without asking the user first.
* **Mandatory Justification**: Whenever proposing a new library, provide a valid, concrete reason explaining why standard JavaScript/Node APIs or existing packages cannot achieve the goal.
* **Zero Dependency Bloat**: Keep the bundle lean; reject heavy or redundant libraries.

---

## 9. Code Reuse & Component DRY Protocol
* **Inspect Before Creating**: Prior to creating any new file, helper, or component, thoroughly search the codebase (`app/`, `components/`, `lib/`) to identify existing reusable solutions.
* **Reuse & Extend**: If a pre-existing component or function can fulfill the requirement (or can be extended via clean props), reuse it instead of creating duplicates.

---

## 10. Single Source of Truth References

### 9.1 API & Backend Rules → Consult `docs/wordpress-api.md`
* Reference file: [docs/wordpress-api.md](docs/wordpress-api.md)
* **Mandatory Rule**: All product queries **MUST** pass `status: "publish"`. Draft and private products must never be exposed.
* **Security Rule**: `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET` must **NEVER** be referenced in client components (`'use client'`). Admin API calls belong exclusively in Server Components or Route Handlers.
* **Caching Rule**: Use Incremental Static Regeneration (`export const revalidate = 60`) on catalog routes.

### 9.2 UI, Layout & Theming Rules → Consult `docs/design-system.md`
* Reference file: [docs/design-system.md](docs/design-system.md)
* **Color Palette**:
  * Forest Green: `#003108` (Primary brand, headers, footers)
  * Crown Gold: `#A67D44` (Accent, CTAs, tags)
  * Sand Cream: `#EFE8E0` (Header bar, subtle surfaces)
  * Warm Border: `#D1B2B2`
  * Studio Canvas: `#FAF8F5` (Body background)
  * Card Surface: `#FFFFFF`
* **Typography**: Exclusively **`Montserrat`**.
* **Container Width**: Max-width is strictly **`1300px`** (`max-w-[1300px] mx-auto`).

---

## 11. Strict Anti-AI-Slop & Design Quality Standards
To ensure CrownLeaf maintains a prestigious, human-crafted B2B executive aesthetic and avoids looking like generic retail stores (e.g., BoxUp Gifting) or cheap AI templates:

1. **Zero Emojis in UI & Copy**:
   * Absolutely **NO** emojis (no `✨`, `🚀`, `📞`, `🎁`, `📦`, `🔥`) in headers, buttons, cards, notification banners, or copy.
   * Use clean SVG icons or crisp typography instead.
2. **No Gimmicky Animations**:
   * **NO** `animate-pulse`, blinking colored dots, or spinning indicators on static badges.
   * Badges must be calm, static, and minimalist (`In Stock`, `Sold Out`).
3. **No Unnecessary Gradients or Neon Glows**:
   * **NO** generic AI-slop gradients (e.g., purple-to-blue, rainbow gradients, glowing neon borders).
   * Stick strictly to solid, authoritative architectural tones from the CrownLeaf palette.
4. **Executive Layout, Not B2C Clutter**:
   * Generous studio white space with framed showcase cards (`aspect-4/3` or `aspect-square`).
   * Subtle, refined borders (`#E2D9CF` / `#D1B2B2`).
   * Products must never touch card borders (always use inner studio padding).
5. **No AI Marketing Fluff**:
   * Avoid generic placeholder copy like *"Transform your gifting journey"*.
   * Use professional, bespoke B2B terminology: *"Curated Corporate Gifting"*, *"Volume Quotation"*, *"Custom Logo Branding Available"*.
