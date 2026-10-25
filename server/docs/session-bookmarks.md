# Session Bookmarks

This document describes the session bookmark model, API routes, authorization,
and bookmark behavior.

## Bookmark fields

The schema is defined in
[`../models/SessionBookmark.js`](../models/SessionBookmark.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `sessionId` | MongoDB ObjectId referencing `Session` | Required | The session being bookmarked. |
| `attendeeId` | MongoDB ObjectId referencing `User` | Required | The attendee who created the bookmark. The server sets this from the authenticated user; clients must not supply it. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique bookmark identifier. |
| `createdAt` | Date | Generated automatically | When the bookmark was created. The schema does not generate `updatedAt`. |

### Database indexes

- A unique index on `{ sessionId, attendeeId }` prevents an attendee from
  bookmarking the same session more than once.
- An index on `{ attendeeId, createdAt }` supports listing an attendee's
  bookmarks newest first.

## API routes

Bookmark endpoints are mounted under `/api/sessions`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `POST /api/sessions/:id/bookmark` | Authenticated attendee | Session ObjectId in the path | Creates a bookmark for the logged-in attendee. Returns HTTP 201 with the bookmark. |
| `DELETE /api/sessions/:id/bookmark` | Authenticated attendee | Session ObjectId in the path | Removes the logged-in attendee's bookmark. Returns a confirmation message. |
| `GET /api/sessions/bookmarks/my` | Authenticated attendee | None | Returns the attendee's bookmarks newest first, with session and event details populated. |

Protected routes require a JWT sent using bearer authentication in the Authorization header. The server derives `attendeeId` from the authenticated user; clients cannot bookmark on behalf of another attendee.

## Bookmark behavior

To add a bookmark:

1. The requester must be authenticated and have the `attendee` role.
2. The path must contain a valid session ObjectId.
3. The session must exist.
4. The attendee must not already have a bookmark for that session.

An invalid ID returns HTTP 400, a missing session returns HTTP 404, and
attempting to add a duplicate bookmark returns HTTP 409.

An attendee can remove only their own bookmark. Removing a bookmark deletes
its record; it is not retained as history. If no bookmark exists for that
attendee and session, the endpoint returns HTTP 404. Since the unique index
only applies to existing records, the attendee can bookmark the session again
after removal.

## Populated bookmark list

`GET /api/sessions/bookmarks/my` populates:

- `sessionId` with the session's `title`, `type`, `startTime`, `endTime`,
  `location`, and `eventId`.
- The populated `eventId` with the event's `name`.

Each result includes the bookmark record and its populated session details.

## Controller functions

Functions are defined in
[`../controllers/bookmarkController.js`](../controllers/bookmarkController.js):

- `addBookmark(req, res)` validates the session ID, confirms the session
  exists, and creates a bookmark for `req.user._id`. Duplicate-key errors are
  returned as HTTP 409 conflicts.
- `removeBookmark(req, res)` deletes the bookmark matching both the session
  ID and the authenticated attendee ID. This ensures attendees can remove only
  their own bookmarks.
- `getMyBookmarks(req, res)` retrieves the authenticated attendee's bookmarks
  newest first and populates the related session and event details.

## Route authorization

In [`../routes/sessionRoutes.js`](../routes/sessionRoutes.js), all bookmark
routes use `protect` followed by `authorizeRoles("attendee")`. The
`/bookmarks/my` route is registered before `/:id` so the literal `bookmarks`
path is not treated as a session ID.

The session router is mounted in [`../app.js`](../app.js) at `/api/sessions`.
