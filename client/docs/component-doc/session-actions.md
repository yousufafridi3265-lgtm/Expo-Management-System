# `SessionActions`

Source: [`SessionActions.jsx`](../../src/components/common/SessionActions.jsx)

Renders attendee actions to bookmark/unbookmark a session and register/cancel
registration. Each API request shows its own busy state and reports results
through notifications.

## Props

- `session`: session record; `_id` is used for API requests and `startTime`
  determines whether registration has started.
- `isBookmarked`, `isRegistered`: current state supplied by the parent.
- `onChanged()`: called after an action finishes, including a failed request,
  so the parent can refresh state.

Registration is unavailable after the session starts. Existing registrations
show a status badge and cancellation action.
