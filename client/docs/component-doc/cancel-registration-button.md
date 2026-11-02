# `CancelRegistrationButton`

Source: [`CancelRegistrationButton.jsx`](../../src/components/common/CancelRegistrationButton.jsx)

Provides an event-registration cancellation button with a confirmation
dialog. The message warns that associated session registrations are cancelled
too.

## Props

- `registrationId`: registration identifier sent to the API.
- `onCancelled()`: called after successful cancellation.

The API result is reported through notifications. The confirmation dialog
shows a loading state during the request.
