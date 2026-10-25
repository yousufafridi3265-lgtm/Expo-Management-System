# Common UI Components

This document describes the reusable React components in
[`../src/components/common`](../src/components/common). They provide shared
buttons, feedback states, page structure, dialogs, and theme controls for the
client. The folder currently contains ten reusable components.

## Components

| Component | Purpose | Main props |
| --- | --- | --- |
| `Button` | Shared button styles and loading behavior. | `children`, `type` (defaults to `button`), `variant` (`primary`, `secondary`, `danger`, or `ghost`; defaults to `primary`), `loading`, `disabled`, `className`, and standard button props. |
| `ConfirmationDialog` | Confirmation popup built on `Modal` and `Button`. | `open`, `message`, `title` (defaults to `Are you sure?`), `confirmText` (defaults to `Confirm`), `danger`, `loading`, `onConfirm`, and `onCancel`. |
| `EmptyState` | Empty-list card with an inbox icon and optional action area. | `title`, optional `message`, and optional `children`. |
| `ErrorMessage` | Error notice with an optional retry button. | `message` and optional `onRetry`. |
| `Modal` | Dialog overlay with close button, Escape handling, backdrop close, and background scroll locking. | `open`, `title`, `onClose`, and `children`. |
| `PageHeader` | Page title and optional subtitle/action area. | `title`, optional `subtitle`, and optional `children` for actions. |
| `PageLoader` | Loading indicator using the app logo; can fill the screen or a page area. | `text` (defaults to `Loading...`) and `fullScreen` (defaults to `false`). |
| `Spinner` | Small decorative spinner, intended for use inside buttons. | No props. |
| `StatusBadge` | Displays a status using a tone mapped from the status value. | `status`. Unknown values use the neutral tone. |
| `ThemeToggle` | Accessible button that switches between light and dark themes. | No props. Requires `ThemeProvider` above it in the React tree. |

## Buttons, loading, and feedback

`Button` forwards standard button attributes. It is disabled if either
`disabled` or `loading` is true, and sets `aria-busy` to the loading state.
When loading, it renders `Spinner` before its children. The button also uses
its children as its `title` text.

Use `PageLoader` for page/data loading. Use `ErrorMessage` for a failed
operation; providing `onRetry` renders a "Try again" button. Use
`EmptyState` when a successful list request has no results; its `children`
slot can contain an action such as a create button.

## Dialogs

`Modal` renders nothing when `open` is false. When open, it presents an
element with `role="dialog"` and `aria-modal="true"`, labels it from the
title, closes on Escape, close-button click, or backdrop click, and prevents
body scrolling until it closes. Clicks inside the dialog panel do not close
it.

`ConfirmationDialog` composes `Modal` and `Button` with Cancel and confirm
actions. `danger` selects the danger style for the confirm action, while
`loading` disables Cancel and shows the loading state on Confirm. The caller
supplies the confirmation and cancellation handlers.

## Theme

`ThemeToggle` reads `theme` and `toggleTheme` from `useTheme()`. Wrap the
application in `ThemeProvider` (as done in
[`../src/main.jsx`](../src/main.jsx)) before rendering it. The provider stores
the selected theme in local storage under `expo_theme` and applies or removes
the `dark` class on the document's root element. Theme colors and reusable
component styles are defined in
[`../src/styles/index.css`](../src/styles/index.css) and
[`../src/styles/components.css`](../src/styles/components.css).

## Styling conventions

Reusable component styles are defined in
[`../src/styles/components.css`](../src/styles/components.css), which is
imported by the main stylesheet. Components use shared classes such as
`btn`, `card`, `badge`, and `page-header`; the stylesheet also defines `field`
styles for form elements. Optional `className` props allow callers to add
page-specific styling where supported.

## Loader asset

`PageLoader` imports `../../assets/logo.jpg`, which is present in the client
assets directory.
