# `EventForm`

Source: [`EventForm.jsx`](../../src/components/Admin/EventForm.jsx)

Controlled create/edit form for events. Existing date values are adapted for
native date inputs, and the parent supplies the save operation.

## Props

- `initialValues`: optional event record for editing.
- `submitLabel`: submit button text.
- `onSubmit(data)`: async callback receiving name, description, start and end
  dates, location, and status.
- `onCancel()`: called when Cancel is clicked.

Name (maximum 150 characters), start date, end date, and location are
required. The end date cannot be before the start date. Supported statuses
are upcoming, ongoing, completed, and cancelled. Callback errors are notified.
