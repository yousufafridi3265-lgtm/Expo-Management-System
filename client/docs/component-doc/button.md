# `Button`

Source: [`Button.jsx`](../../src/components/common/Button.jsx)

Shared native button wrapper with design variants and loading feedback.
Standard button attributes are forwarded to the underlying `<button>`.

## Props

- `children`: button content.
- `type`: native button type; defaults to `"button"`.
- `variant`: `"primary"`, `"secondary"`, `"danger"`, or `"ghost"`; defaults to
  `"primary"`.
- `loading`, `disabled`: loading disables the button and sets `aria-busy`.
- `className`: additional CSS classes.

While loading, it renders `Spinner` before the children.
