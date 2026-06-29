# Dashboard Navigation And Spin Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Settings to the dashboard profile dropdown and keep the Daily Spin button fully visible at desktop and mobile widths.

**Architecture:** Reuse the existing Radix dropdown item and Next.js link pattern for Settings. Remove equal flex-height allocation from the dashboard left column and give the spin wrapper an intrinsic minimum height so its existing content controls layout without clipping.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide icons.

---

### Task 1: Profile Settings Link

**Files:**
- Modify: `app/dashboard/_components/navbar.tsx`

- [ ] **Step 1: Add the Settings item**

After `My Activities`, add a `DropdownMenuItem asChild` containing a Next.js `Link` to `/dashboard/settings`, the existing `Settings` icon, label `Settings`, and subtitle `Profile, Telegram & account`.

- [ ] **Step 2: Run focused lint**

Run: `npx eslint app/dashboard/_components/navbar.tsx`

Expected: exit 0 with no errors.

### Task 2: Daily Spin Card Sizing

**Files:**
- Modify: `app/dashboard/page.tsx`
- Verify: `app/dashboard/_components/mini-spin-wheel.tsx`

- [ ] **Step 1: Remove equal-height pressure**

Change the left column from a height-sharing flex column to normal block flow. Remove `flex-1` from the Daily Spin motion wrapper and Quick Tasks card.

- [ ] **Step 2: Set intrinsic spin space**

Give the Daily Spin wrapper a minimum height sufficient for the existing header, 192px wheel, status region, button, and padding: `min-h-[440px] sm:min-h-[460px]`. Keep `MiniSpinWheel` behavior and wheel dimensions unchanged.

- [ ] **Step 3: Run TypeScript and focused lint**

Run: `npx tsc --noEmit --incremental false`

Run: `npx eslint app/dashboard/page.tsx app/dashboard/_components/mini-spin-wheel.tsx`

Expected: both commands exit 0.

### Task 3: Responsive Visual Verification

**Files:**
- Verify: `/dashboard` in the local app.

- [ ] **Step 1: Start the development server**

Run: `npm run dev`

Expected: Next.js reports a local URL and serves the dashboard.

- [ ] **Step 2: Verify desktop layout**

At approximately 1900x1000, confirm the complete Spin button is inside the card, the result message does not overlap it, and Quick Tasks starts below the card with the normal 24px grid gap.

- [ ] **Step 3: Verify mobile layout**

At approximately 390x844, confirm the wheel, result message, and Spin button remain visible without horizontal overflow or clipping.

### Task 4: Frontend Commit

**Files:**
- Stage only `app/dashboard/_components/navbar.tsx` and `app/dashboard/page.tsx`.

- [ ] **Step 1: Review the scoped diff**

Run: `git diff --check`

Run: `git diff -- app/dashboard/_components/navbar.tsx app/dashboard/page.tsx`

- [ ] **Step 2: Commit**

Run: `git commit -m "fix(dashboard): expose settings and spin action"`

