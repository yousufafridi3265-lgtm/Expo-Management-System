# `Textarea`

Source: [`Textarea.jsx`](../../src/components/forms/Textarea.jsx)

Labeled native textarea control with a generated ID and shared validation
display and styling.

## Props

- `label`, `error`, `required`: field label, validation message, and native
  required behavior.
- `rows`: textarea row count; defaults to `4`.
- `className`: optional classes appended to the shared `field` class.
- Remaining native textarea props, including `name`, `value`, and `onChange`,
  are forwarded.

Errors set `aria-invalid`, connect `aria-describedby` to the error message,
and apply `field-error`.
