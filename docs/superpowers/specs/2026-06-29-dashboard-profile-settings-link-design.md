# Dashboard Profile Settings Link Design

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

