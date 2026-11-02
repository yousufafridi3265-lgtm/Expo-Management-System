# `FormField`

Source: [`FormField.jsx`](../../src/components/forms/FormField.jsx)

Shared wrapper for a form control, its optional label, required marker, and
validation message. It is used by `Input`, `Select`, and `Textarea`.

## Props

- `id`: control identifier used by the label and error message.
- `label`: optional label text.
- `error`: optional validation message; rendered with `role="alert"` and an ID
  derived from `id`.
- `required`: displays a required marker when a label exists.
- `children`: the form control.
