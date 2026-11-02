# `FeedbackForm`

Source: [`FeedbackForm.jsx`](../../src/components/messages/FeedbackForm.jsx)

Collects feedback subject and description, validates them, and delegates
submission to its parent.

## Props

- `onSubmit(data)`: async callback receiving trimmed `subject` and
  `description`.
- `onCancel()`: called when Cancel is clicked.

Both fields are required. Subject is limited to 150 characters and description
to 2,000 characters. Submission disables actions while pending; callback
errors are shown through notifications.
