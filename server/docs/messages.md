# Messages and Event Inquiries

This document describes the inquiry model, API routes, access rules, and
admin reply behavior.

## Message fields

The schema is defined in
[`../models/Message.js`](../models/Message.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `senderId` | MongoDB ObjectId referencing `User` | Required | The authenticated exhibitor or attendee who sent the inquiry. The server sets this value; clients must not supply it. |
| `eventId` | MongoDB ObjectId referencing `Event` | Optional | Event the inquiry concerns. When provided, the event must exist. |
| `subject` | String | Required | Trimmed; at most 150 characters. |
| `message` | String | Required | Inquiry text, trimmed; at most 2000 characters. |
| `status` | String | Defaults to `open` | Must be `open` or `replied`. |
| `reply` | String | Optional | Admin reply, trimmed; at most 2000 characters. |
| `repliedBy` | MongoDB ObjectId referencing `User` | Optional | Admin who replied. Set by the server. |
| `repliedAt` | Date | Optional | Time the admin reply was recorded. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique inquiry identifier used by the reply route. |
| `createdAt` | Date | Generated automatically | Inquiry creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last inquiry update timestamp. |

### Database indexes

- An index on `{ senderId, createdAt }` supports listing a sender's inquiries
  newest first.
- An index on `{ status, createdAt }` supports admin status filtering and
  newest-first listing.

## API routes

All message endpoints are mounted under `/api/messages`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/messages` | Authenticated exhibitor or attendee | JSON with `subject`, `message`, and optional `eventId` | Creates an inquiry for the logged-in user. Returns HTTP 201 with the message record. |
| `GET /api/messages/my` | Authenticated exhibitor or attendee | None | Returns the current user's inquiries newest first, with event names populated. |
| `GET /api/messages` | Authenticated admin | Optional `status` and `eventId` query parameters | Lists inquiries newest first, optionally filtered, with sender and event details populated. |
| `PUT /api/messages/:id/reply` | Authenticated admin | JSON `{ "reply": "..." }` | Replies to an open inquiry and changes its status to `replied`. |

Protected routes require a JWT sent using bearer authentication in the Authorization header. The server derives `senderId` from the authenticated user; clients must not submit a sender ID, status, or admin reply metadata when creating an inquiry.

Example inquiry request:

```json
{
  "subject": "Question about event access",
  "message": "Could you share the venue access details?",
  "eventId": "671234567890abcdef123456"
}
```

`eventId` may be omitted if the inquiry is not about a specific event.

### Admin filters

- `status` must be `open` or `replied`; any other value returns HTTP 400.
- `eventId`, when supplied, must be a valid MongoDB ObjectId.
- Without filters, the admin endpoint returns all inquiries.

## Inquiry and reply lifecycle

New inquiries receive the `open` status. An admin can reply only once while
the inquiry is open. A successful reply stores the reply text, the replying
admin's ID, and the reply time, then changes the status to `replied`.

The reply update filters on both the inquiry ID and `status: "open"` in one
database operation. This ensures that if multiple admins attempt to reply at
the same time, only one can update the inquiry. A missing inquiry returns
HTTP 404; an inquiry that already has a reply returns HTTP 409.

## Populated response details

- `GET /api/messages/my` populates `eventId` with the event's `name`.
- `GET /api/messages` populates `senderId` with `name`, `email`, and `role`,
  and `eventId` with the event's `name`.

## Controller functions

Functions are defined in
[`../controllers/messageController.js`](../controllers/messageController.js):

- `createMessage(req, res)` validates an optional event ID and verifies that
  the event exists, then creates an inquiry using the authenticated user's ID.
- `getMyMessages(req, res)` returns the authenticated user's inquiries newest
  first, with event names populated.
- `getAllMessages(req, res)` validates optional status and event filters,
  retrieves matching inquiries newest first, and populates sender and event
  summaries.
- `replyToMessage(req, res)` validates the inquiry ID and reply text, then
  atomically replies to an open inquiry and records admin and timestamp
  metadata.

The controller uses shared validation and error helpers from
[`../utils/fail.js`](../utils/fail.js).

## Route authorization

In [`../routes/messageRoutes.js`](../routes/messageRoutes.js):

- `POST /` and `GET /my` require `protect` followed by
  `authorizeRoles("exhibitor", "attendee")`.
- `GET /` and `PUT /:id/reply` require `protect` followed by
  `authorizeRoles("admin")`.

The router is mounted in [`../app.js`](../app.js) at `/api/messages`.
