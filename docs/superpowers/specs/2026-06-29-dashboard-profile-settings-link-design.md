# Dashboard Navigation And Daily Spin Design

## Goal

Make the existing dashboard settings page directly accessible from the profile dropdown.

## Placement

Add a `Settings` menu item in the dashboard navbar profile dropdown after `My Activities` and before the separator above `Log out`.

## Content

- Label: `Settings`
- Supporting text: `Profile, Telegram & account`
- Icon: the existing Lucide `Settings` icon
- Destination: `/dashboard/settings`

## Interaction

The item uses the same `DropdownMenuItem` and Next.js `Link` pattern as the neighboring profile and activity links. Keyboard navigation, focus behavior, responsive dropdown sizing, and menu dismissal therefore remain inherited from the existing Radix menu implementation.

## Scope

No settings-page content, sidebar navigation, profile route, logout behavior, styling system, or unrelated navbar item will change.

## Verification

- TypeScript and lint checks pass for the navbar.
- The item renders in the profile dropdown with the requested label and subtitle.
- Activating the item navigates to `/dashboard/settings`.

## Daily Spin Layout

The Daily Spin card must size itself to its content instead of sharing the left-column height equally with Quick Tasks. The existing wheel dimensions and interaction remain unchanged.

The dashboard will:

- Remove equal `flex-1` height distribution from the Daily Spin wrapper and Quick Tasks card.
- Give the Daily Spin wrapper enough minimum height for its header, wheel, status message, and button.
- Keep the Spin button fully visible inside the card without scrolling or clipping.
- Preserve responsive wheel sizing and normal vertical stacking on mobile.

## Daily Spin Verification

- The full Spin button is visible at the desktop viewport represented by the supplied screenshot.
- The button remains visible at mobile width.
- The wheel, result message, and button do not overlap.
- Existing spin behavior remains unchanged.
