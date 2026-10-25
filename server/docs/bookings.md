# Booth Bookings

This document describes the booking data model, API routes, booking and
cancellation rules, controller functions, and the relationship between
bookings, booths, events, and exhibitors.

## Booking fields

The schema is defined in
[`../models/Booking.js`](../models/Booking.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `eventId` | MongoDB ObjectId referencing `Event` | Required | Event associated with the booked booth. The server copies this from the booth; clients do not choose it. |
| `boothId` | MongoDB ObjectId referencing `Booth` | Required | Booth being reserved. The server uses the booth found from the submitted ID. |
| `exhibitorId` | MongoDB ObjectId referencing `Exhibitor` | Required | Company profile making the booking. The server finds it using the authenticated user's ID. |
| `status` | String | Defaults to `confirmed` | Must be `confirmed` or `cancelled`. |
| `cancelledAt` | Date | Optional | Set by the server when a confirmed booking is cancelled. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique booking identifier used by the cancel route. |
| `createdAt` | Date | Generated automatically | Booking creation time. |
| `updatedAt` | Date | Generated automatically | Last booking update time. |

### Database indexes

- A partial unique index on `boothId` applies only to documents with
  `status: "confirmed"`. It guarantees that a booth cannot have more than one
  confirmed booking, while preserving cancelled bookings as history and
  allowing the booth to be booked again.
- An index on `{ exhibitorId, createdAt }` supports retrieving one exhibitor's
  bookings in reverse chronological order.

## API routes

All booking endpoints are mounted under `/api/bookings`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/bookings` | Authenticated exhibitor | JSON `{ "boothId": "<booth ObjectId>" }` | Books a booth for the logged-in exhibitor, if the profile is approved and the booth's event is upcoming. Returns HTTP 201 with the booking. |
| `GET /api/bookings/my` | Authenticated exhibitor | Bearer token | Returns the current exhibitor's bookings, newest first, with booth and event details. Returns an empty array if the user has no exhibitor profile. |
| `GET /api/bookings` | Authenticated admin | Optional `eventId` and `status` query parameters | Lists all bookings, optionally filtered, newest first, with booth, event, and exhibitor company/contact details. |
| `PUT /api/bookings/:id/cancel` | Authenticated exhibitor or admin | Booking ObjectId in the path | Cancels a confirmed booking. An exhibitor can cancel only their own booking; an admin can cancel any confirmed booking. The booth is then made available again. |

Admin and exhibitor routes require a JWT sent using bearer authentication in the Authorization header. The user role is checked from the current user record loaded by authentication middleware.

Example booking request:

```json
{
  "boothId": "671234567890abcdef123456"
}
```

The request must not provide `eventId` or `exhibitorId`. The server derives
those values from the selected booth and the authenticated exhibitor profile.

### Admin filters

- `eventId` must be a valid MongoDB ObjectId and filters bookings for that
  event.
- `status` must be `confirmed` or `cancelled`. Any other status returns 400.
- Without filters, the admin endpoint returns all bookings.

## Booking rules and lifecycle

To create a booking, all of the following must be true:

1. The request is authenticated as an exhibitor.
2. The exhibitor has created a company profile.
3. The profile's `approvalStatus` is `approved`.
4. The requested booth exists.
5. The booth's event exists and has status `upcoming`.
6. The booth is currently `available`.
7. No other confirmed booking already reserves that booth.

On success, a confirmed booking is created and the booth status changes to
`booked`. Admins cannot directly set a booth to `booked`; that state belongs to
the booking flow. Cancellation changes the booking to `cancelled`, records
`cancelledAt`, and changes the booth back to `available`. The cancelled
booking record remains in the database as history.

## Controller functions and why they are used

Functions are defined in
[`../controllers/bookingController.js`](../controllers/bookingController.js):

- `withDetails(query)` adds booth and event fields to booking queries using
  Mongoose `populate()`. It centralizes the related information returned by
  exhibitor and admin list endpoints.
- `createBooking(req, res)` validates the booth ID, verifies the exhibitor
  profile exists and is approved, checks booth and event availability, creates
  the booking, and atomically changes the booth from `available` to `booked`.
  A duplicate-key error from the confirmed-booking unique index is converted
  to a 409 conflict.
- `getMyBookings(req, res)` finds the authenticated user's exhibitor profile
  and returns that profile's bookings. If no profile exists, it returns `[]`.
- `getAllBookings(req, res)` validates optional filters, lists matching
  bookings newest first, populates booth/event details, and adds the
  exhibitor's company name and phone number.
- `cancelBooking(req, res)` validates the booking ID, permits cancellation only
  for a confirmed booking, scopes exhibitor requests to their own profile,
  records cancellation, and returns the booth to `available`.

The controller uses the shared `fail` helper from
[`../utils/fail.js`](../utils/fail.js) to produce HTTP errors.

## Why both a database index and a booth status check are used

The early booth status check gives a quick, clear response when a booth is
already unavailable. It is not sufficient by itself when two booking requests
arrive at nearly the same time. The partial unique index on confirmed
`boothId` values is the database-level protection that ensures only one
request can create a confirmed booking.

After creating the booking, the controller updates the booth only when its
status is still `available`. If that conditional update fails, it deletes the
newly created booking and returns a conflict. This handles a booth that became
unavailable between the earlier check and the update.

## Routes and authorization

In [`../routes/bookingRoutes.js`](../routes/bookingRoutes.js):

- `POST /` and `GET /my` require `protect` followed by
  `authorizeRoles("exhibitor")`.
- `GET /` requires `protect` followed by `authorizeRoles("admin")`.
- `PUT /:id/cancel` permits either `exhibitor` or `admin`; the controller
  checks ownership for exhibitors.
- `protect` runs first so that the role middleware and controller can use
  `req.user`.

## Related models and event deletion

- A booking references one booth, one event, and one exhibitor profile.
- The event ID is copied from the booth, ensuring the client cannot pair a
  booth with a different event in the booking request.
- The event controller prevents deletion of an event while it has booths.
  Consequently, events with bookings also remain protected from deletion
  until their booths have been removed.
