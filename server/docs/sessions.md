# Sessions

This document describes session fields, API routes, access rules, scheduling
validation, and session deletion behavior.

## Session fields

The schema is defined in
[`../models/Session.js`](../models/Session.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `eventId` | MongoDB ObjectId referencing `Event` | Required | The event that hosts the session. Set when creating a session; it cannot be changed through the update endpoint. |
| `title` | String | Required | Trimmed; at most 150 characters. |
| `description` | String | Defaults to an empty string | Optional session description. |
| `type` | String | Defaults to `session` | Must be `session` or `workshop`. |
| `startTime` | Date | Required | Session start date and time. |
| `endTime` | Date | Required | Must be later than `startTime`. |
| `location` | String | Defaults to an empty string | Optional session location; trimmed. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique session identifier used by detail and management routes. |
| `createdAt` | Date | Generated automatically | Session creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last session update timestamp. |

### Database index

An index on `{ eventId, startTime }` supports retrieving and ordering sessions
by event and start time.

## API routes

Session endpoints are mounted under `/api/sessions`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `GET /api/sessions` | Public | Optional `eventId` and `type` query parameters | Lists sessions ordered by start time, optionally filtered by event or type. |
| `GET /api/sessions/:id` | Public | Session ObjectId in the path | Returns the matching session. |
| `POST /api/sessions` | Authenticated admin | JSON with `eventId`, `title`, `startTime`, `endTime`, and optional session fields | Creates a session within the event's date range. Returns HTTP 201 with the session. |
| `PUT /api/sessions/:id` | Authenticated admin | Session ObjectId and one or more editable session fields | Updates the session after validating its fields and event date range. |
| `DELETE /api/sessions/:id` | Authenticated admin | Session ObjectId in the path | Deletes the session and its associated bookmarks and registrations. |

Protected routes require a JWT sent using bearer authentication in the Authorization header.

Example session request:

```json
{
  "eventId": "671234567890abcdef123456",
  "title": "Building accessible web applications",
  "description": "Practical accessibility techniques.",
  "type": "workshop",
  "startTime": "2026-11-12T10:00:00.000Z",
  "endTime": "2026-11-12T11:30:00.000Z",
  "location": "Workshop Room A"
}
```

### List filters

- `eventId`, when supplied, must be a valid MongoDB ObjectId.
- `type` must be `session` or `workshop`.
- Invalid filters return HTTP 400.
- Sessions are sorted by `startTime` in ascending order.

## Scheduling and update rules

When creating a session:

1. The requester must be authenticated and have the `admin` role.
2. The supplied event ID must be valid and identify an existing event.
3. The session's `endTime` must be later than its `startTime`.
4. Both session times must fall within the event's date range. The event's
   ending date is treated as inclusive through the end of that day.

Session updates accept only `title`, `description`, `type`, `startTime`,
`endTime`, and `location`. The event association cannot be changed. An update
must include at least one editable field and the resulting session must still
pass model validation and fit within the event dates.

## Controller functions

Functions are defined in
[`../controllers/sessionController.js`](../controllers/sessionController.js):

- `getSessions(req, res)` validates optional event and type filters, then
  returns matching sessions sorted by start time.
- `getSessionById(req, res)` validates the session ID and returns 404 if the
  session does not exist.
- `createSession(req, res)` validates the event, selects allowed session
  fields, checks the session against model rules and event dates, and creates
  the record.
- `updateSession(req, res)` validates the ID and provided fields, prevents
  changing the event association, and validates the updated session against
  its event.
- `deleteSession(req, res)` deletes the session and removes its related
  `SessionBookmark` and `SessionRegistration` records.

The controller uses the shared `checkValidId`, `applyFields`, and `fail`
helpers from [`../utils/fail.js`](../utils/fail.js).

## Related session routes

The session router in [`../routes/sessionRoutes.js`](../routes/sessionRoutes.js)
also provides attendee bookmark and registration routes, plus an admin route
to view registrations for a session. Their details are documented in
[`session-bookmarks.md`](./session-bookmarks.md) and the session registration
API is handled by
[`../controllers/sessionRegistrationController.js`](../controllers/sessionRegistrationController.js).

## Route authorization

- `GET /` and `GET /:id` are public.
- Session create, update, and delete require `protect` followed by
  `authorizeRoles("admin")`.
- Attendee bookmark and session registration routes require the `attendee`
  role; the session registration list for a session requires the `admin` role.

The session router is mounted in [`../app.js`](../app.js) at `/api/sessions`.
