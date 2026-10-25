# Admin Dashboard

This document describes the administrator dashboard statistics endpoint and
the resource counts included in its response.

## Registered admin route

The admin router is defined in
[`../routes/adminRoutes.js`](../routes/adminRoutes.js) and mounted under
`/api/admin`. It currently registers one route:

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `GET /api/admin/stats` | Authenticated admin | None | Returns aggregate counts for users and expo-management resources. |

The route applies `protect`, then `authorizeRoles("admin")`, and finally calls
`getDashboardStats`. The router does not currently define other admin
endpoints.

Protected routes require a JWT sent using bearer authentication in the Authorization header.

## Response structure

The response is a JSON object with the following top-level properties:

| Property | Counted collection | Breakdown |
| --- | --- | --- |
| `users` | Users | `total`, and one count for each user role: `admin`, `exhibitor`, `attendee`. |
| `events` | Events | `total`, and one count for each event status: `upcoming`, `ongoing`, `completed`, `cancelled`. |
| `exhibitors` | Exhibitor profiles | `total`, and one count for each approval status: `pending`, `approved`, `rejected`. |
| `booths` | Booths | `total`, and one count for each booth status: `available`, `booked`, `unavailable`. |
| `bookings` | Booth bookings | `total`, and one count for each booking status: `confirmed`, `cancelled`. |
| `eventRegistrations` | Event registrations | `total`, and one count for each status: `registered`, `cancelled`. |
| `sessions` | Sessions | `total` only. |
| `sessionRegistrations` | Session registrations | `total`, and one count for each status: `registered`, `cancelled`. |
| `messages` | Messages/inquiries | `total`, and one count for each status: `open`, `replied`. |
| `feedback` | Feedback records | `total`, and one count for each status: `new`, `reviewed`. |

Example response shape:

```json
{
  "users": {
    "total": 25,
    "admin": 2,
    "exhibitor": 8,
    "attendee": 15
  },
  "events": {
    "total": 4,
    "upcoming": 2,
    "ongoing": 1,
    "completed": 1,
    "cancelled": 0
  },
  "exhibitors": {
    "total": 8,
    "pending": 2,
    "approved": 5,
    "rejected": 1
  },
  "booths": {
    "total": 20,
    "available": 12,
    "booked": 6,
    "unavailable": 2
  },
  "bookings": {
    "total": 6,
    "confirmed": 5,
    "cancelled": 1
  },
  "eventRegistrations": {
    "total": 30,
    "registered": 28,
    "cancelled": 2
  },
  "sessions": {
    "total": 10
  },
  "sessionRegistrations": {
    "total": 18,
    "registered": 16,
    "cancelled": 2
  },
  "messages": {
    "total": 5,
    "open": 3,
    "replied": 2
  },
  "feedback": {
    "total": 7,
    "new": 4,
    "reviewed": 3
  }
}
```

The numbers above are illustrative; actual counts depend on the database.

## Counting behavior

For models with an enumerated status or role field, the controller initializes
each allowed value to zero, aggregates the records by that field, and returns
the total alongside the per-value counts. This means allowed categories with
no records still appear with a count of `0`.

Session records do not have a status breakdown in this endpoint; the
controller returns the result of `Session.countDocuments()` as
`sessions.total`.

The counts cover all records in their respective collections. The endpoint
does not accept filters or a date range. It runs the independent count
operations concurrently and returns their results together.

## Controller and authorization

`getDashboardStats(req, res)` is defined in
[`../controllers/adminController.js`](../controllers/adminController.js). It
uses `countByField(Model, field)` for role/status breakdowns and responds with
the combined statistics object.

In [`../routes/adminRoutes.js`](../routes/adminRoutes.js), `GET /stats`
requires `protect` followed by `authorizeRoles("admin")`. The router is
mounted in [`../app.js`](../app.js) at `/api/admin`.
