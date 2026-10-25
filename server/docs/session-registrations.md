# Session Registrations

This document describes attendee registrations for sessions, including model
fields, API routes, eligibility rules, cancellation behavior, and database
indexes.

## Registration fields

The schema is defined in
[`../models/SessionRegistration.js`](../models/SessionRegistration.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `sessionId` | MongoDB ObjectId referencing `Session` | Required | Session the attendee registers for. |
| `attendeeId` | MongoDB ObjectId referencing `User` | Required | User account making the registration. The server sets it from the authenticated user; clients must not supply it. |
| `status` | String | Defaults to `registered` | Must be `registered` or `cancelled`. |
| `cancelledAt` | Date | Optional | Set by the server when an active registration is cancelled. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique registration identifier. |
| `createdAt` | Date | Generated automatically | Registration creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last registration update timestamp. |

### Database indexes

- A partial unique index on `{ sessionId, attendeeId }` applies only when
  `status` is `registered`. It prevents duplicate active registrations for
  the same attendee and session, while allowing registration again after
  cancellation.
- An index on `{ attendeeId, createdAt }` supports listing an attendee's
  registrations newest first.

## API routes

Session registration endpoints are mounted under `/api/sessions`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/sessions/:id/register` | Authenticated attendee | Session ObjectId in the path | Registers the attendee for a future session, provided they are registered for its event. Returns HTTP 201 with the registration. |
| `DELETE /api/sessions/:id/register` | Authenticated attendee | Session ObjectId in the path | Cancels the attendee's active registration for that session and records `cancelledAt`. |
| `GET /api/sessions/registrations/my` | Authenticated attendee | None | Returns the attendee's session registrations newest first, with session and event details populated. |
| `GET /api/sessions/:id/registrations` | Authenticated admin | Optional `status` query parameter | Lists a session's registrations newest first, with attendee names and emails populated. |

Protected routes require a JWT sent using bearer authentication in the Authorization header. The server
uses the authenticated user ID as `attendeeId`; clients cannot register on
behalf of another user.

### Admin status filter

- `status` must be `registered` or `cancelled`.
- An unsupported value returns HTTP 400.
- Without a status filter, the endpoint returns all registrations for the
  selected session.

## Registration and cancellation rules

Registration succeeds only when:

1. The requester is authenticated and has the `attendee` role.
2. The session ID is valid and the session exists.
3. The session has not started yet.
4. The attendee has an active `registered` registration for the session's
   event.
5. The attendee does not already have an active registration for that
   session.

The server sets the status to `registered` by default. The database's partial
unique index enforces one active registration per attendee and session,
including concurrent requests. A duplicate active registration returns
HTTP 409. If the attendee is not registered for the event, the request returns
HTTP 403.

An attendee can cancel only their own active session registration. Cancellation
sets its status to `cancelled`, records the current time in `cancelledAt`, and
retains the record as history. The attendee may register for the session again
after cancellation, as long as the session has not started and the attendee
remains registered for its event.

## Populated response details

- `GET /api/sessions/registrations/my` populates `sessionId` with `title`,
  `type`, `startTime`, `endTime`, `location`, and `eventId`; the populated
  event includes its `name`.
- `GET /api/sessions/:id/registrations` populates `attendeeId` with `name` and
  `email`.

## Controller functions

Functions are defined in
[`../controllers/sessionRegistrationController.js`](../controllers/sessionRegistrationController.js):

- `registerForSession(req, res)` validates the session ID, checks that the
  session exists and has not started, verifies the attendee's active event
  registration, and creates the session registration. Duplicate-key errors
  are returned as HTTP 409 conflicts.
- `cancelSessionRegistration(req, res)` updates only an active registration
  matching both the session and authenticated attendee IDs.
- `getMySessionRegistrations(req, res)` retrieves all registrations for the
  authenticated attendee, newest first, and populates session and event
  details.
- `getSessionRegistrations(req, res)` validates the session ID and optional
  status filter, verifies the session exists, and lists its registrations
  with attendee details.

The controller uses the shared `checkValidId`, `failOnDuplicate`, and `fail`
helpers from [`../utils/fail.js`](../utils/fail.js).

## Route authorization and event cancellation

In [`../routes/sessionRoutes.js`](../routes/sessionRoutes.js):

- Attendee registration, cancellation, and personal-list routes use `protect`
  followed by `authorizeRoles("attendee")`.
- The per-session registration list uses `protect` followed by
  `authorizeRoles("admin")`.

When an attendee cancels their event registration through
[`../routes/registrationRoutes.js`](../routes/registrationRoutes.js), the
registration controller also cancels that attendee's active registrations
for sessions belonging to the event.

The session router is mounted in [`../app.js`](../app.js) at `/api/sessions`.
