# Expo Management System - Server

This folder contains the Express and MongoDB backend for the Expo Management
System. It exposes REST API endpoints for authentication, events, exhibitors,
booths, bookings, registrations, sessions, messages, feedback, users, and
administrator dashboard statistics.

## Requirements and setup

- Install a supported Node.js release and npm.
- Run `npm install` from this folder.
- Configure the environment variables listed below in a local `.env` file.
- Make sure the MongoDB instance configured by `MONGO_URI` is reachable.

Do not commit `.env` or put database credentials, JWT secrets, or admin
passwords in source control.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string used by the server. |
| `JWT_SECRET` | Yes for token creation and verification | Secret used to sign and verify authentication tokens. |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `7d`. |
| `PORT` | No | HTTP port; defaults to `5000`. |
| `CLIENT_URL` | No | Allowed CORS origin; defaults to `http://localhost:5173`. |
| `ADMIN_EMAIL` | For `seed:admin` | Email for the administrator account; the seed script trims and lowercases it. |
| `ADMIN_PASSWORD` | For `seed:admin` | Password for a new admin account; must be at least 8 characters. |
| `ADMIN_NAME` | No | Name for a newly created admin; defaults to `Admin`. |
| `TEST_DB_NAME` | No | API-test database name; defaults to `expo-management-test` and must contain `test`. |

## Run and maintain the server

Run these commands from the `server` folder:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the API in Node watch mode. |
| `npm start` | Starts the API normally. |
| `npm run seed:admin` | Creates an admin or promotes an existing user matching `ADMIN_EMAIL`. If the account exists, its password is not changed. |
| `npm run test:api` | Runs the API test script against a separate test database. |

The API connects to MongoDB before listening. A successful health check is
available at `GET /api/health` and returns a JSON status message.

### API test database safety

The API test script drops and recreates its selected database. It refuses to
run unless the database name contains `test`. Keep `TEST_DB_NAME` set to a
dedicated test database; never point it at a database containing application
data.

## API route overview

The routes below are mounted by [`app.js`](./app.js). Unless noted as public,
routes require authentication; role-restricted routes also require the
specified role.

| Base path | Main operations | Access |
| --- | --- | --- |
| `/api/health` | `GET` health check | Public |
| `/api/auth` | Register, log in, and retrieve the current user profile | Register/login are public; `/me` is authenticated |
| `/api/events` | List, view, create, update, and delete events | Reads are public; writes are admin-only |
| `/api/exhibitors` | Public approved-profile list/detail; manage own profile and logo; admin review and approval | Public, exhibitor, or admin depending on route |
| `/api/booths` | List, view, create, update, and delete booths | Reads are public; writes are admin-only |
| `/api/bookings` | Create and view exhibitor bookings; admin listing; cancel a booking | Exhibitor or admin depending on route |
| `/api/registrations` | Register for an event, view own registrations, cancel, and admin list | Attendee or admin depending on route |
| `/api/sessions` | Public session list/detail; admin session management; attendee bookmarks and registrations; admin session-registration list | Public, attendee, or admin depending on route |
| `/api/messages` | Submit and view own inquiries; admin list and reply | Exhibitor/attendee or admin depending on route |
| `/api/feedback` | Submit feedback; admin list and mark reviewed | Exhibitor/attendee or admin depending on route |
| `/api/admin` | Dashboard statistics | Admin-only |
| `/api/users` | List users, optionally filtered by role | Admin-only |

For endpoint details, request fields, rules, response data, and authorization,
see the documentation index in [`docs/skill.md`](./docs/skill.md) and the
individual guides in [`docs/`](./docs).

## Project structure

| Path | Responsibility |
| --- | --- |
| `app.js` | Configures Express, CORS, JSON parsing, health check, static logo serving, route mounting, and error middleware. |
| `server.js` | Loads environment configuration, connects to MongoDB, and starts the HTTP listener. |
| `config/` | Database connection setup. |
| `routes/` | Express routers that map API paths to middleware and controllers. |
| `controllers/` | API request handling and business rules. |
| `models/` | Mongoose schemas, validation rules, and database indexes. |
| `middleware/` | Authentication, role authorization, not-found handling, and centralized error responses. |
| `utils/` | Shared error/ID helpers, token generation, and logo-upload utilities. |
| `scripts/` | Administrative scripts, including the admin seed script. |
| `tests/` | API test runner. |
| `uploads/logos/` | Uploaded exhibitor logos, served publicly under `/uploads/logos`. |
| `docs/` | Detailed Markdown documentation for backend modules and endpoints. |

## Authentication and access control

Protected requests include a JWT in the `Authorization` header. The
authentication middleware verifies the token and loads the user from MongoDB;
authorization checks the user's current database role. Public registration
supports attendee and exhibitor accounts. Administrator accounts are created
or promoted with the seed script.

## Error responses

Errors are returned as JSON with a `message`. The shared error middleware
maps common Mongoose validation, cast, and duplicate-key errors to HTTP 400
or 409. Authentication failures return 401, role failures return 403, and
unknown routes return 404. Error stacks are omitted in production.
