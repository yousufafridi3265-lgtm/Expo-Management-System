# `EventSessions`

Source: [`EventSessions.jsx`](../../src/components/common/EventSessions.jsx)

Loads an event's sessions and renders each as a `SessionCard`. Attendees also
get controls to bookmark sessions and register or cancel registration.

## Props

- `eventId`: event identifier used to fetch sessions.

Non-attendees do not request attendee-only bookmark and registration data.
After session actions change, those attendee lists are refreshed. Session
loading and failure states are shown, and an empty schedule has an explanatory
message.
