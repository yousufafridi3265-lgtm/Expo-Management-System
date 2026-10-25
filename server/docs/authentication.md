# Authentication and User Accounts

This document explains the user fields, request formats, authentication
endpoints, and the purpose of the functions used by the current authentication
implementation.

## User model fields

The schema is defined in
[`../models/User.js`](../models/User.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `name` | String | Required | User's name; trimmed; between 2 and 100 characters. |
| `email` | String | Required and unique | Email address; trimmed and converted to lowercase; must match the model's basic email pattern. Duplicate emails are rejected by MongoDB's unique index. |
| `passwordHash` | String | Required | Bcrypt hash of the password. It is excluded from query results by default and must never be sent to clients. |
| `role` | String | Defaults to `attendee` | Must be `admin`, `exhibitor`, or `attendee`. Public registration only allows `exhibitor` and `attendee`; admin accounts are not created through the public registration endpoint. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique identifier for the user. This ID is included in the JWT payload and safe user response. |
| `createdAt` | Date | Generated automatically | Account creation timestamp. |

Mongoose timestamps are configured to generate `createdAt` only; there is no
automatic `updatedAt` field.

## Authentication endpoints

All authentication routes are mounted under `/api/auth` in
[`../app.js`](../app.js).

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `POST /api/auth/register` | Public | JSON with `name`, `email`, `password`, and optional `role` | HTTP 201 with `{ "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "..." } }` |
| `POST /api/auth/login` | Public | JSON with `email` and `password` | HTTP 200 with the same token and safe-user structure as registration |
| `GET /api/auth/me` | Authenticated | JWT sent using bearer authentication in the Authorization header | HTTP 200 with `{ "user": { "id": "...", "name": "...", "email": "...", "role": "..." } }` |

### Registration request

Required properties are `name`, `email`, and `password`, all sent as strings.
`password` must contain at least six characters. `role` is optional and
defaults to `attendee`; if supplied, it must be `attendee` or `exhibitor`.
Whitespace around the email is removed and the email is lowercased for the
duplicate lookup. The User model also validates the name and email when the
record is created.

Example:

```json
{
  "name": "Sam Example",
  "email": "sam@example.com",
  "password": "example-password",
  "role": "attendee"
}
```

### Login request

Both `email` and `password` must be strings. The email is trimmed and
lowercased before lookup. A missing user and an incorrect password return the
same 401 message (`Invalid email or password`) so the response does not reveal
whether an email is registered.

Example:

```json
{
  "email": "sam@example.com",
  "password": "example-password"
}
```

### Using the token

Include the token returned by registration or login on protected requests:

```text
Authorization: Bearer YOUR_TOKEN
```

The token lifetime is controlled by `JWT_EXPIRES_IN` and defaults to `7d`.
The token contains the user ID, not the role. Protected-request middleware
loads the user from MongoDB each time, so it uses the user's current database
role.

## Functions and why they are used

### Controller

Functions are in
[`../controllers/authController.js`](../controllers/authController.js):

- `formatUser(user)` constructs the public user object with only `id`, `name`,
  `email`, and `role`. It prevents private fields such as `passwordHash` from
  being included in API responses.
- `buildAuthResponse(user)` combines the generated JWT and safe user object
  into the common registration/login response format.
- `register(req, res)` validates request types, password length, and allowed
  public role; checks for an existing normalized email; hashes the password
  with bcrypt; creates the user; and returns HTTP 201 with a token and safe
  user profile.
- `login(req, res)` validates the input types, requests the normally-hidden
  password hash for verification, compares the submitted password with bcrypt,
  and returns a token and safe profile if credentials match.
- `getMe(req, res)` returns the safe profile for `req.user`. The `protect`
  middleware must run first to set that user.

The controller uses the shared
[`fail` helper](../utils/fail.js) to set an HTTP status and pass an error to
the centralized error middleware.

### User model

In [`../models/User.js`](../models/User.js), `userSchema` defines field types,
required checks, normalization, limits, allowed roles, password-hash query
protection, and account timestamps. `mongoose.model("User", userSchema)`
creates the model used by controllers to query and write users.

### Token generation

In [`../utils/generateToken.js`](../utils/generateToken.js):

- `generateToken(userId)` requires `JWT_SECRET` to be configured, then signs a
  JWT containing `{ id: userId }`.
- `expiresIn` uses `JWT_EXPIRES_IN`, or `7d` when that variable is not set.
- The role is intentionally not embedded in the token; authorization uses the
  current user record loaded from MongoDB.

### Authentication middleware

In [`../middleware/authMiddleware.js`](../middleware/authMiddleware.js),
`protect(req, res, next)`:

1. Reads the `Authorization` header and requires the `Bearer ` prefix.
2. Verifies the token using `JWT_SECRET`.
3. Finds the user by the ID in the verified token.
4. Returns 401 if the token is missing, invalid/expired, or its user no longer
   exists.
5. Sets `req.user` and calls `next()` when authentication succeeds.

### Routes

In [`../routes/authRoutes.js`](../routes/authRoutes.js), the Express router
connects:

- `POST /register` to `register`.
- `POST /login` to `login`.
- `GET /me` to `protect` followed by `getMe`.

The middleware order on `/me` ensures the controller only runs after the
request has been authenticated.

## Typical error responses

Errors pass through the shared
[`error middleware`](../middleware/errorMiddleware.js), which returns a JSON
object containing a `message`.

| HTTP status | Example condition/message |
| --- | --- |
| `400` | Required registration fields are missing or not strings; password is shorter than six characters; a public role is not allowed; or model validation fails. |
| `401` | Login credentials are invalid; token is missing, invalid, or expired; or the token's user no longer exists. |
| `409` | Registration email is already in use. |
| `500` | Unexpected server error, including missing `JWT_SECRET` during token generation. |

The error middleware includes an error stack only outside production.

## Configuration required

- `JWT_SECRET` must be set to sign and verify authentication tokens.
- `JWT_EXPIRES_IN` is optional; when omitted, tokens expire after seven days.
- `MONGO_URI` must point to the MongoDB database containing user records.

The server connects to MongoDB before listening, as configured by
[`../server.js`](../server.js).
