# `ReplyForm`

Source: [`ReplyForm.jsx`](../../src/components/Admin/ReplyForm.jsx)

Collects an organizer's reply to a message and delegates sending it to the
parent.

## Props

- `onSubmit(reply)`: async callback receiving the trimmed reply string.
- `onCancel()`: called when Cancel is clicked.

Reply text is required and limited to 2,000 characters. Submission disables
the actions while pending; callback errors are shown through notifications.
