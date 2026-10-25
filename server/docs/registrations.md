# Event Registrations

This document describes attendee registrations for events, including model
fields, API routes, registration rules, controller behavior, and the database
indexes that enforce registration constraints.

## Registration fields

The schema is defined in
[`../models/EventRegistration.js`](../models/EventRegistration.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `eventId` | MongoDB ObjectId referencing `Event` | Required | Event the attendee registers for. The server looks up the event using the submitted ID. |
| `attendeeId` | MongoDB ObjectId referencing `User` | Required | User account making the registration. The server sets it from the authenticated user; clients must not supply it. |
| `status` | String | Defaults to `registered` | Must be `registered` or `cancelled`. |
| `cancelledAt` | Date | Optional | Set by the server when an active registration is cancelled. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique registration identifier used by the cancel route. |
| `createdAt` | Date | Generated automatically | Registration creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last registration update timestamp. |

### Database indexes

- A partial unique index on `{ eventId, attendeeId }` applies only when
  `status` is `registered`. It prevents duplicate active registrations for the
  same attendee and event, while allowing the attendee to register again after
  cancelling.
- An index on `{ attendeeId, createdAt }` supports listing an attendee's
  registrations newest first.

## API routes

All registration endpoints are mounted under `/api/registrations`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/registrations` | Authenticated attendee | JSON `{ "eventId": "<event ObjectId>" }` | Registers the logged-in attendee for an upcoming event. Returns HTTP 201 with the registration. |
| `GET /api/registrations/my` | Authenticated attendee | None | Returns the attendee's registrations, newest first, with selected event details populated. |
| `PUT /api/registrations/:id/cancel` | Authenticated attendee | Registration ObjectId in the path | Cancels only the logged-in attendee's active registration and records `cancelledAt`. |
| `GET /api/registrations` | Authenticated admin | Optional `eventId` and `status` query parameters | Lists all registrations, newest first, optionally filtered, with attendee and event details. |

Protected routes require a JWT sent using bearer authentication in the Authorization header. The server
uses the authenticated user ID as `attendeeId`; a client cannot register on
behalf of another user.

Example registration request:

```json
{
  "eventId": "671234567890abcdef123456"
}
```

### Admin list filters

- `eventId` must be a valid MongoDB ObjectId and filters registrations by
  event.
- `status` must be `registered` or `cancelled`; an unsupported value returns
  400.
- Without filters, the admin endpoint returns all registrations.

## Registration and cancellation rules

Registration succeeds only when:

1. The requester is authenticated and has the `attendee` role.
2. The provided event exists.
3. The event status is `upcoming`.
4. The attendee does not already have an active registration for that event.

The server sets the registration status to `registered` by default. The
database's partial unique index enforces one active registration per attendee
and event, including when concurrent requests arrive. A duplicate registration
returns a conflict.

An attendee can cancel only their own registration, and only while its status
is `registered`. Cancellation sets the status to `cancelled` and adds the
current time to `cancelledAt`. The event registration record is retained as
history. The controller also cancels the attendee's active registrations for
sessions belonging to that event, recording a cancellation time for each.

Since the event registration's unique index applies only to active
registrations, the attendee may register for the event again after
cancellation.

## Populated response details

- `GET /api/registrations/my` populates `eventId` with `name`, `startDate`,
  `endDate`, `location`, and `status`.
- `GET /api/registrations` for admins populates `attendeeId` with `name` and
  `email`, and `eventId` with `name` and `startDate`.

## Controller functions and why they are used

Functions are defined in
[`../controllers/registrationController.js`](../controllers/registrationController.js):

- `createRegistration(req, res)` validates the event ID, checks that the event
  exists and is upcoming, creates a registration using `req.user._id`, and
  converts duplicate-key errors into a 409 conflict.
- `getMyRegistrations(req, res)` finds registrations for the authenticated
  attendee, sorts them newest first, and populates useful event fields.
- `getAllRegistrations(req, res)` validates optional filters, lists matching
  registrations newest first, and populates attendee and event summaries for
  admin review.
- `cancelRegistration(req, res)` validates the registration ID and updates
  only a registration that both belongs to the requester and is still
  `registered`. This ownership/status filter prevents cancellation of another
  attendee's registration or one already cancelled.

The controller uses the shared `checkValidId`, `failOnDuplicate`, and `fail`
helpers from [`../utils/fail.js`](../utils/fail.js) for ID validation and
consistent HTTP errors.

## Route authorization

In [`../routes/registrationRoutes.js`](../routes/registrationRoutes.js):

- Attendee create, own-list, and cancellation routes are protected by
  `protect` followed by `authorizeRoles("attendee")`.
- The admin list is protected by `protect` followed by
  `authorizeRoles("admin")`.
- `protect` runs first because role authorization depends on the authenticated
  `req.user`.

The router is mounted by
[`../app.js`](../app.js) at `/api/registrations`.
