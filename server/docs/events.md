# Event Management

This document describes the event model, controller functions, routes, and
server startup behavior currently implemented in the backend.

## Event fields

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `name` | String | Required | Event name; whitespace is trimmed; maximum 150 characters. |
| `description` | String | Optional; defaults to `""` | Event details; whitespace is trimmed. |
| `startDate` | Date | Required | Event start date/time. Send a date value parseable by JavaScript, preferably an ISO 8601 string such as `2026-10-24T09:00:00.000Z`. |
| `endDate` | Date | Required | Event end date/time; must be the same as or later than `startDate`. |
| `location` | String | Required | Event location; whitespace is trimmed. |
| `status` | String | Defaults to `"upcoming"` | Must be `upcoming`, `ongoing`, `completed`, or `cancelled`. |
| `createdBy` | MongoDB ObjectId referencing `User` | Required | The authenticated admin who created the event. The server sets this from the logged-in user; clients must not provide it. |
| `createdAt` | Date | Generated automatically | Creation timestamp added by Mongoose. |
| `updatedAt` | Date | Generated automatically | Last-save timestamp added by Mongoose. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique event identifier used in the `:id` routes. |

The schema also creates an ascending index on `startDate`, which supports the
event list's chronological ordering.

## API routes

All event endpoints are mounted under `/api/events`.

| Method and path | Access | Expected input | Result |
| --- | --- | --- | --- |
| `GET /api/events` | Public | Optional `status` query, for example `?status=upcoming` | Events matching the exact status filter, sorted by `startDate` ascending. Without a status query, returns all events. |
| `GET /api/events/:id` | Public | MongoDB event ID in the path | Returns the matching event; invalid IDs return 400 and missing events return 404. |
| `POST /api/events` | Admin only | JSON object with event fields | Creates and returns an event with status 201. `createdBy` is taken from the authenticated admin. |
| `PUT /api/events/:id` | Admin only | Event ID and a JSON object containing one or more editable fields | Updates only supplied event fields and returns the saved event. Invalid IDs return 400 and missing events return 404. |
| `DELETE /api/events/:id` | Admin only | MongoDB event ID in the path | Deletes the event and returns a success message; invalid IDs return 400 and missing events return 404. |

For create and update requests, the editable fields are `name`, `description`,
`startDate`, `endDate`, `location`, and `status`. Unknown body fields are
ignored. The model validates required values, status options, and date order.
Send an `Authorization: Bearer <token>` header for admin-only routes; the token
must belong to a user whose current database role is `admin`.

Example create request body:

```json
{
  "name": "Technology Expo",
  "description": "A showcase of new products",
  "startDate": "2026-10-24T09:00:00.000Z",
  "endDate": "2026-10-24T17:00:00.000Z",
  "location": "Expo Hall A",
  "status": "upcoming"
}
```

## Controller functions and why they are used

In [`../controllers/eventController.js`](../controllers/eventController.js):

- `pickEventFields(body)` returns only fields that clients are allowed to
  create or edit. This prevents clients from setting protected fields such as
  `createdBy`.
- `checkValidId(res, id)` checks the MongoDB ID format before database lookups,
  so malformed IDs produce a clear 400 response instead of a database cast
  error.
- `getEvents(req, res)` reads the optional status filter, retrieves matching
  events, and sorts them by start date for the public event listing.
- `getEventById(req, res)` validates the supplied ID, finds one event, and
  returns 404 if it does not exist.
- `createEvent(req, res)` filters the submitted fields and creates an event.
  It uses `req.user._id` for `createdBy`, so ownership comes from the verified
  login rather than untrusted request data.
- `updateEvent(req, res)` validates the ID, loads the event, applies only
  supplied editable fields, and calls `save()` so schema validation runs.
- `deleteEvent(req, res)` validates the ID, removes the event, and reports a
  404 if there was nothing to delete.

The controller uses the shared [`fail` helper](../utils/fail.js) to set an HTTP
status and pass an error to centralized error middleware.

## Route middleware

In [`../routes/eventRoutes.js`](../routes/eventRoutes.js):

- Public `GET` routes do not require authentication, allowing visitors to
  browse events.
- `protect` runs before admin write handlers. It verifies the Bearer token,
  loads the current user, and sets `req.user`.
- `authorizeRoles("admin")` runs after `protect` and permits writes only when
  the loaded user's role is `admin`. This order is required because role
  authorization depends on `req.user`.

## Server setup and startup

- [`../app.js`](../app.js) creates the Express app, enables JSON request
  parsing and CORS, registers `/api/auth` and `/api/events`, and installs
  not-found and error middleware after the routes.
- The health check is currently `GET /api/check`.
- [`../server.js`](../server.js) loads environment configuration, calls
  `connectDB()` before listening, and starts the server on `PORT` or port
  `5000` by default.
