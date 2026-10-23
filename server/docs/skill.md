# Server Skills and Implemented Work

This folder is for Markdown documentation about the server, including skill files.
This document records the backend functionality currently implemented in the
server source code.

## Server setup

- Express application is configured in `app.js`.
- JSON request bodies are enabled.
- CORS allows the configured `CLIENT_URL`; it defaults to
  `http://localhost:5173`.
- `GET /api/health` returns the API health status.
- Authentication routes are mounted under `/api/auth`.
- Event routes are mounted under `/api/events`; details are documented in
  [events.md](./events.md).
- Exhibitor profile and logo-upload details are documented in
  [exhibitors.md](./exhibitors.md).
- Booth fields, endpoints, access rules, and controller behavior are
  documented in [booths.md](./booths.md).
- Booking fields, reservation/cancellation rules, and API behavior are
  documented in [bookings.md](./bookings.md).
- Attendee event-registration fields, rules, routes, and controller behavior
  are documented in [registrations.md](./registrations.md).
- Not-found and centralized error middleware handle failed requests.
- `server.js` loads environment variables, connects to MongoDB, and starts the
  HTTP server.

## User accounts and authentication

- Detailed user fields, request formats, authentication functions, and error
  responses are documented in [authentication.md](./authentication.md).
- The user model stores a name, normalized email, bcrypt password hash, role,
  and creation timestamp.
- Password hashes are excluded from normal database query results.
- Public registration supports the `attendee` and `exhibitor` roles. The
  default role is `attendee`; public registration cannot create an `admin`.
- Registration checks required input, enforces a six-character minimum
  password, and reports an already-registered email.
- Login checks the submitted password against its bcrypt hash.
- Successful registration and login return a JWT and a safe user object that
  does not include the password hash.
- JWTs contain the user ID and expire after `JWT_EXPIRES_IN`, defaulting to
  seven days.
- Protected requests provide the JWT in the `Authorization` header. The
  authentication middleware verifies the token and loads the current user from
  MongoDB.
- Role authorization middleware is available for restricting routes to
  selected roles.

## Authentication endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register an attendee or exhibitor |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Authenticated | Return the authenticated user's safe profile |

## Error handling

- Unknown routes return a 404 response.
- Mongoose validation errors return 400.
- Duplicate database values return 409.
- Authentication failures return 401; role authorization failures return 403.
- Error responses include a stack trace outside production only.

## Environment and commands

The server reads these environment variables:

- `MONGO_URI` - MongoDB connection string.
- `JWT_SECRET` - secret used to sign and verify JWTs.
- `JWT_EXPIRES_IN` - optional JWT lifetime; defaults to `7d`.
- `PORT` - optional HTTP port; defaults to `5000`.
- `CLIENT_URL` - optional allowed CORS origin; defaults to
  `http://localhost:5173`.

From the `server` directory:

- `npm run dev` starts the server in watch mode.
- `npm start` starts the server.
