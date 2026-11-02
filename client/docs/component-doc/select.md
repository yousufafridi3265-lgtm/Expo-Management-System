# `Select`

Source: [`Select.jsx`](../../src/components/forms/Select.jsx)

Labeled native select control with shared validation display and styling.

## Props

- `label`, `error`, `required`: field label, validation message, and native
  required behavior.
- `options`: array of `{ value, label }`; defaults to an empty array.
- `placeholder`: optional first option with an empty-string value.
- `className`: optional classes appended to the shared `field` class.
- Remaining native select props, such as `value` and `onChange`, are forwarded.

An error sets `aria-invalid`, associates the error message with the control,
and applies the `field-error` class.
