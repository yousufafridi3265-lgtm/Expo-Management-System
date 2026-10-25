# Feedback

This document describes feedback fields, API routes, access rules, and
controller behavior.

## Feedback fields

The schema is defined in
[`../models/Feedback.js`](../models/Feedback.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `userId` | MongoDB ObjectId referencing `User` | Required | The user who submitted the feedback. The server sets it from the authenticated user; clients must not supply it. |
| `subject` | String | Required | Trimmed; at most 150 characters. |
| `description` | String | Required | Trimmed; at most 2000 characters. |
| `status` | String | Defaults to `new` | Must be `new` or `reviewed`. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique feedback identifier used by the review route. |
| `createdAt` | Date | Generated automatically | Feedback creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last feedback update timestamp. |

### Database index

An index on `{ status, createdAt }` supports filtering feedback by status and
listing it newest first.

## API routes

All feedback endpoints are mounted under `/api/feedback`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/feedback` | Authenticated exhibitor or attendee | JSON with `subject` and `description` | Creates feedback for the logged-in user. Returns HTTP 201 with the feedback. |
| `GET /api/feedback` | Authenticated admin | Optional `status` query parameter | Lists feedback newest first, optionally filtered by status, with submitter name, email, and role populated. |
| `PUT /api/feedback/:id/review` | Authenticated admin | Feedback ObjectId in the path | Marks the feedback as `reviewed` and returns the updated feedback. |

Protected routes require a JWT sent using bearer authentication in the Authorization header. The server derives `userId`
from the authenticated request; clients must not submit a `userId` or `status`
when creating feedback.

Example feedback request:

```json
{
  "subject": "Exhibitor registration experience",
  "description": "The registration process was easy to follow."
}
```

### Admin status filter

- `status` must be `new` or `reviewed`.
- An unsupported value returns HTTP 400.
- Without a status filter, the admin endpoint returns all feedback.

## Feedback lifecycle

New feedback receives the `new` status by default. An admin can mark it as
`reviewed`; the feedback record remains stored, with its status updated.

## Controller functions

Functions are defined in
[`../controllers/feedbackController.js`](../controllers/feedbackController.js):

- `createFeedback(req, res)` creates a feedback record using the authenticated
  user's ID and the submitted subject and description.
- `getAllFeedback(req, res)` validates the optional status filter, retrieves
  matching feedback newest first, and populates submitter details.
- `markFeedbackReviewed(req, res)` validates the feedback ID, updates its
  status to `reviewed`, and returns 404 if no matching feedback exists.

## Route authorization

In [`../routes/feedbackRoutes.js`](../routes/feedbackRoutes.js):

- `POST /` requires `protect` followed by
  `authorizeRoles("exhibitor", "attendee")`.
- `GET /` and `PUT /:id/review` require `protect` followed by
  `authorizeRoles("admin")`.

The router is mounted in [`../app.js`](../app.js) at `/api/feedback`.
