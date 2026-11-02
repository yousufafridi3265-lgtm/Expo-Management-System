# `MessageForm`

Source: [`MessageForm.jsx`](../../src/components/messages/MessageForm.jsx)

Collects a message to organizers with an optional event association. Event
choices are fetched by the component.

## Props

- `onSubmit(data)`: async callback receiving trimmed `subject` and `message`,
  plus `eventId` only when selected.
- `onCancel()`: called when Cancel is clicked.

Subject and message are required and each is limited to 150 and 2,000
characters respectively. Submission reports callback errors and shows a busy
state. The event selector is optional.
