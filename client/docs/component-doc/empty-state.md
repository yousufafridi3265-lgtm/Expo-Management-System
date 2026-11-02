# `EmptyState`

Source: [`EmptyState.jsx`](../../src/components/common/EmptyState.jsx)

Displays an inbox icon, heading, optional explanation, and optional action
content inside a card. Useful when a successful request returns no records.

## Props

- `title`: heading content.
- `message`: optional explanatory text.
- `children`: optional content such as a create button.
- `headingTag`: heading element/component to render; defaults to `"h3"`.
  Pass `"h1"` when the empty state is the page's main heading.
