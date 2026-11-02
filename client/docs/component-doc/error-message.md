# `ErrorMessage`

Source: [`ErrorMessage.jsx`](../../src/components/common/ErrorMessage.jsx)

Accessible error notice using `role="alert"`. An optional retry action lets
the user repeat a failed operation.

## Props

- `message`: displayed error text; falls back to `"Something went wrong."`
  when empty.
- `onRetry`: optional callback; when provided, renders a Try again button.
