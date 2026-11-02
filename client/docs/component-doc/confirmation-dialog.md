# `ConfirmationDialog`

Source: [`ConfirmationDialog.jsx`](../../src/components/common/ConfirmationDialog.jsx)

Composes `Modal` and `Button` to present Cancel and confirm actions.

## Props

- `open`: controls visibility.
- `title`: dialog heading; defaults to `"Are you sure?"`.
- `message`: optional explanatory text.
- `confirmText`: confirm button label; defaults to `"Confirm"`.
- `danger`: uses the danger button variant when true.
- `loading`: disables Cancel and puts the confirm button in its loading state.
- `onConfirm()`, `onCancel()`: action callbacks.
