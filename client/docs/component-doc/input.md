# `Input`

Source: [`Input.jsx`](../../src/components/forms/Input.jsx)

Labeled native input with a generated ID and shared form styling.

## Props

- `label`, `error`, `required`: field label, validation message, and native
  required behavior.
- `className`: optional classes appended to the shared `field` class.
- Remaining native input props, including `type`, `name`, `value`, and
  `onChange`, are forwarded to `<input>`.

`useId()` associates its label and validation message with the control. An
error adds `field-error`, sets `aria-invalid`, and sets `aria-describedby`.
