# Booth Management

This document describes booth fields, API routes, access requirements,
controller behavior, and the current implementation details.

## Booth fields

The schema is defined in
[`../models/Booth.js`](../models/Booth.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `eventId` | MongoDB ObjectId referencing `Event` | Required | The event this booth belongs to. The controller checks that the referenced event exists when creating a booth. |
| `boothNumber` | String | Required | Booth identifier, trimmed, maximum 20 characters. Must be unique within its event; the same number can be used for another event. |
| `location` | String | Optional; defaults to `""` | Floor-plan location, trimmed; for example, `Hall A, Row 2`. |
| `size` | String | Required | Booth size as text, trimmed; for example, `3x3 m`. The schema does not enforce a specific format. |
| `price` | Number | Required | Booth price; must be zero or greater. The API does not specify a currency. |
| `status` | String | Defaults to `available` | Must be `available`, `booked`, or `unavailable`. Admins may set `available` or `unavailable`; booking logic is expected to manage `booked`. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique booth identifier used by the detail, update, and delete routes. |
| `createdAt` | Date | Generated automatically | Creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last update timestamp. |

A unique compound index on `{ eventId, boothNumber }` prevents duplicate booth
numbers for the same event.

## API routes

All booth endpoints are mounted under `/api/booths`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `GET /api/booths` | Public | Optional `eventId` and `status` query parameters | Lists booths, optionally filtered by event and/or status. Results are ordered by booth number using numeric collation, so `A2` sorts before `A10`. |
| `GET /api/booths/:id` | Public | Booth ObjectId in the path | Returns one booth. Invalid IDs should return 400; a valid but missing booth returns 404. |
| `POST /api/booths` | Authenticated admin | JSON booth fields including `eventId` | Creates a booth and returns HTTP 201. The referenced event must exist. |
| `PUT /api/booths/:id` | Authenticated admin | Booth ObjectId and one or more editable booth fields | Updates supplied fields and returns the updated booth. Booked booths cannot be changed. |
| `DELETE /api/booths/:id` | Authenticated admin | Booth ObjectId in the path | Deletes the booth and returns a success message. Booked booths cannot be deleted. |

Admin routes require an `Authorization: Bearer <token>` header for a user whose
current database role is `admin`. Public list filters accept these status
values: `available`, `booked`, and `unavailable`. An invalid status filter
returns 400.

### Create request example

```json
{
  "eventId": "671234567890abcdef123456",
  "boothNumber": "A2",
  "location": "Hall A, Row 2",
  "size": "3x3 m",
  "price": 250,
  "status": "available"
}
```

### Update behavior

Only `boothNumber`, `location`, `size`, `price`, and `status` are accepted in
update requests. `eventId` is deliberately not editable, so an existing booth
cannot be moved to a different event through this endpoint. Send only the
properties to change. An empty update is rejected with 400. Admins cannot set
the status to `booked`.

## Controller functions and why they are used

Functions are defined in
[`../controllers/boothController.js`](../controllers/boothController.js):

- `pickBoothFields(body)` selects the fields accepted for booth creation and
  updates. Excluding `eventId` on updates prevents changing the booth's event.
- `checkAdminStatus(res, status)` allows an admin to set only `available` or
  `unavailable`; the booking flow is responsible for setting `booked`.
- `failNotFoundOrBooked(res, id)` distinguishes a missing booth (404) from an
  existing booth that could not be changed because it is booked (409).
- `getBooths(req, res)` validates optional filters, queries matching booths,
  and sorts booth numbers with numeric ordering.
- `getBoothById(req, res)` validates the requested ID, finds the booth, and
  returns 404 if no booth exists.
- `createBooth(req, res)` validates the event ID and admin status, confirms
  that the event exists, then creates the booth. The schema and database
  enforce required values, valid price, and event-scoped booth-number
  uniqueness.
- `updateBooth(req, res)` validates the booth ID and status, applies only
  provided allowlisted fields, rejects an empty update, and updates only a
  booth whose current status is not `booked`.
- `deleteBooth(req, res)` deletes only a booth whose current status is not
  `booked`.

The update and delete database queries include `status: { $ne: "booked" }`.
This combines the booked-status guard with the write operation, reducing the
risk of an admin change racing with a booking. If that guarded operation finds
no booth, `failNotFoundOrBooked` determines whether the result is 404 or 409.

## Route protection

In [`../routes/boothRoutes.js`](../routes/boothRoutes.js):

- Both `GET` routes are public.
- `POST`, `PUT`, and `DELETE` run `protect` followed by
  `authorizeRoles("admin")`.
- Authentication runs first so the role middleware can inspect `req.user`.

## Current implementation note

The controller calls `checkValidId` in list/detail/create/update handlers and
`applyFields` in the update handler, but neither function is imported in
[`../controllers/boothController.js`](../controllers/boothController.js).
Those requests can currently fail with a `ReferenceError` rather than complete
their intended validation/update behavior. In addition, the shared
[`../utils/fail.js`](../utils/fail.js) defines `checkValidId` using
`mongoose.isValidObjectId` but does not import `mongoose`. These are source
code issues noted here for accuracy; this documentation change does not modify
the implementation.

## Server registration

- [`../app.js`](../app.js) mounts the booth router at `/api/booths`, after
  authentication, event, and exhibitor routes.
- [`../server.js`](../server.js) connects to MongoDB before starting the HTTP
  server. The port is `PORT`, or `5000` when `PORT` is not set.
