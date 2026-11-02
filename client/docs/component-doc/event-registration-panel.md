# `EventRegistrationPanel`

Source: [`EventRegistrationPanel.jsx`](../../src/components/common/EventRegistrationPanel.jsx)

Displays event registration controls according to authentication, user role,
event status, and existing registration state.

## Props

- `event`: event record with `_id` and `status`.

Unauthenticated users get a login link that preserves the current path.
Attendees can register for upcoming events or cancel an active registration;
other roles see an explanatory message. Registration data is fetched by the
component, with loading and retryable error states.
