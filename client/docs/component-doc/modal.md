# `Modal`

Source: [`Modal.jsx`](../../src/components/common/Modal.jsx)

Renders an accessible dialog when open. It closes from Escape, the close
button, or backdrop clicks; clicks inside the panel do not close it. While
open, it prevents body scrolling.

## Props

- `open`: controls whether the dialog is rendered.
- `title`: dialog heading used by `aria-labelledby`.
- `onClose()`: called by each supported close action.
- `children`: dialog body.
