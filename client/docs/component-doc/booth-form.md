# `BoothForm`

Source: [`BoothForm.jsx`](../../src/components/Admin/BoothForm.jsx)

Controlled create/edit form for an event booth. Validation runs before
submission and the parent supplies the persistence operation.

## Props

- `initialValues`: optional booth values used to initialize editing.
- `submitLabel`: text displayed on the submit button.
- `onSubmit(data)`: async callback receiving trimmed booth number and size,
  numeric price, trimmed location, and status.
- `onCancel()`: called when Cancel is clicked.

Booth number (maximum 20 characters), size, and a non-negative numeric price
are required. Status options are Available and Unavailable; booking status is
managed by the booking flow. Callback errors are shown as notifications.
