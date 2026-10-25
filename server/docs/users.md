# User Accounts

This document describes user account fields and the admin API for listing
users.

## User fields

The schema is defined in [`../models/User.js`](../models/User.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `name` | String | Required | Trimmed; between 2 and 100 characters. |
| `email` | String | Required and unique | Trimmed, converted to lowercase, and validated against the model's basic email pattern. Duplicate email addresses are prevented by a database unique index. |
| `passwordHash` | String | Required | Stores the password hash, not the original password. Excluded from query results by default with `select: false`. |
| `role` | String | Defaults to `attendee` | Must be `admin`, `exhibitor`, or `attendee`. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique user identifier. |
| `createdAt` | Date | Generated automatically | Account creation timestamp. The schema does not generate `updatedAt`. |

Password hashing and authentication are handled by the authentication
endpoints documented in [`authentication.md`](./authentication.md).

## Admin account setup

Public registration does not allow the `admin` role. Create or promote an
administrator using the seed script defined in
[`../scripts/seedAdmin.js`](../scripts/seedAdmin.js).

Set these environment variables in the server's `.env` file:

| Variable | Required | Behavior |
| --- | --- | --- |
| `ADMIN_EMAIL` | Yes | Email address for the administrator. The script trims whitespace and converts it to lowercase. |
| `ADMIN_PASSWORD` | Yes | Password for a new administrator; must be at least 8 characters. |
| `ADMIN_NAME` | No | Name used when creating a new administrator. Defaults to `Admin`. |

Run the command from the `server` directory:

```sh
npm run seed:admin
```

The script connects to the configured database. If the email already belongs
to a user, it changes that user's role to `admin` and leaves the existing
password unchanged. Otherwise, it hashes the configured password with bcrypt
and creates a new admin account. Do not commit `.env` or share its credentials.

## Registered API route

The user router is defined in
[`../routes/userRoutes.js`](../routes/userRoutes.js) and mounted under
`/api/users`. It currently registers one route:

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `GET /api/users` | Authenticated admin | Optional `role` query parameter | Lists users newest first, returning only `name`, `email`, `role`, and `createdAt`. |

Protected routes require a JWT sent using bearer authentication in the Authorization header.

### Role filter

- `role` must be `admin`, `exhibitor`, or `attendee`.
- An unsupported value returns HTTP 400.
- Without a role filter, the endpoint returns users of all roles.

## Response and privacy

The user-list query explicitly selects `name`, `email`, `role`, and
`createdAt`. It does not select or return `passwordHash`. Password hashes are
also excluded from queries by default in the model.

## Controller and route authorization

`getUsers(req, res)` is defined in
[`../controllers/userController.js`](../controllers/userController.js). It
validates the optional role filter, retrieves the selected user fields, sorts
the results newest first, and returns them as JSON.

In [`../routes/userRoutes.js`](../routes/userRoutes.js), `GET /` requires
`protect` followed by `authorizeRoles("admin")`. The router is mounted in
[`../app.js`](../app.js) at `/api/users`.
