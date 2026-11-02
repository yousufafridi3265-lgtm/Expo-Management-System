# `SessionForm`

Source: [`SessionForm.jsx`](../../src/components/Admin/SessionForm.jsx)

Controlled create/edit form for an event session or workshop. Date-time values
are converted between the browser's local `datetime-local` input and UTC
timestamps for submission.

## Props

- `initialValues`: optional session record for editing.
- `submitLabel`: submit button text.
- `onSubmit(data)`: async callback receiving trimmed title, type, ISO start/end
  timestamps, location, and description.
- `onCancel()`: called when Cancel is clicked.

Title (maximum 150 characters), start, and end are required. The end must be
later than the start. Type options are Session and Workshop; event-boundary
validation is handled by the backend.
