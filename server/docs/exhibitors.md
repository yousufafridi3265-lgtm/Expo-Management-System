# Exhibitor Profiles

This document describes the exhibitor profile fields, API endpoints, controller
and upload functions, access rules, and current implementation notes.

## Exhibitor profile fields

The schema is defined in
[`../models/Exhibitor.js`](../models/Exhibitor.js).

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `userId` | MongoDB ObjectId referencing `User` | Required and unique | User account that owns the profile. The server takes this from the authenticated exhibitor; the request body cannot set it. The unique constraint permits only one profile per user. |
| `companyName` | String | Required | Company name; whitespace is trimmed; maximum 150 characters. |
| `phone` | String | Required | Contact phone number; whitespace is trimmed. The current schema does not enforce a particular phone format. |
| `address` | String | Required | Company address; whitespace is trimmed. |
| `description` | String | Optional; defaults to `""` | Company description; whitespace is trimmed. |
| `category` | String | Required | Company category; whitespace is trimmed. |
| `logo` | String | Defaults to `""` | Public URL path for the logo, such as `/uploads/logos/<generated-file-name>.png`. |
| `products` | Array of product objects | Defaults to `[]` | List of products offered by the exhibitor. |
| `approvalStatus` | String | Defaults to `pending` | Must be `pending`, `approved`, or `rejected`. Admins change this status; exhibitors cannot set it through their profile endpoints. |
| `_id` | MongoDB ObjectId | Generated automatically | Unique profile ID, used by the public detail route and admin status route. |
| `createdAt` | Date | Generated automatically | Profile creation timestamp. |
| `updatedAt` | Date | Generated automatically | Last profile update timestamp. |

### Product fields

Each product is embedded in the exhibitor document; it is not a separate
collection.

| Field | Type | Required/default | Expected value and behavior |
| --- | --- | --- | --- |
| `name` | String | Required | Product name; whitespace is trimmed; maximum 100 characters. |
| `description` | String | Optional; defaults to `""` | Product details; whitespace is trimmed. |

Embedded products do not receive their own `_id`. The controller checks that a
provided `products` value is an array; the model validates product fields when
the profile is saved.

The schema has a compound index on `approvalStatus` and `category` to support
common public-list filters.

## API endpoints

All endpoints are mounted under `/api/exhibitors`.

| Method and path | Access | Input | Purpose and result |
| --- | --- | --- | --- |
| `GET /api/exhibitors` | Public | Optional `search` and `category` query parameters | Lists approved profiles only, optionally filtered by category and company/product name. Results are sorted by company name. `userId` is omitted from these public results. |
| `GET /api/exhibitors/my` | Authenticated exhibitor | Bearer token | Returns the current exhibitor's full profile, including approval status. Returns 404 if the account has not created a profile. |
| `POST /api/exhibitors` | Authenticated exhibitor | JSON profile fields, optionally `products` | Creates one profile for the logged-in exhibitor. Status starts as `pending`; returns HTTP 201. A second profile for the same user is rejected. |
| `PUT /api/exhibitors/my` | Authenticated exhibitor | JSON with one or more editable profile fields | Updates supplied fields on the current exhibitor's profile. Returns 404 if no profile exists. |
| `PUT /api/exhibitors/my/logo` | Authenticated exhibitor | `multipart/form-data` with one file field named `logo` | Validates and uploads a logo, updates the profile's logo path, then attempts to remove the previous logo. |
| `GET /api/exhibitors/admin/all` | Authenticated admin | Optional `approvalStatus` query (`pending`, `approved`, or `rejected`) | Lists all profiles, optionally filtered by approval status; populates owner's `name` and `email`; newest profiles first. |
| `PUT /api/exhibitors/:id/status` | Authenticated admin | JSON `{ "approvalStatus": "approved" }` (or `pending` / `rejected`) | Changes the profile approval status and returns the updated profile. Invalid status returns 400; missing profile returns 404. |
| `GET /api/exhibitors/:id` | Public | Profile ObjectId in the path | Returns one approved profile, omitting `userId`. Invalid IDs return 400; missing or unapproved profiles return 404. |

The router registers `/my` and `/admin/all` before `/:id` so these named paths
are not mistaken for profile IDs.

### Profile create/update fields

The controller accepts only these profile fields from a create or update body:
`companyName`, `phone`, `address`, `description`, `category`, and `products`.
Fields such as `userId`, `logo`, and `approvalStatus` are excluded from that
allowlist. Set the logo through the dedicated upload endpoint; approval status
is controlled through the admin endpoint.

Example profile body:

```json
{
  "companyName": "Example Foods",
  "phone": "+1 555 0100",
  "address": "100 Expo Avenue",
  "description": "Local food products",
  "category": "food",
  "products": [
    {
      "name": "Organic Tea",
      "description": "Loose-leaf tea"
    }
  ]
}
```

For profile update, send only the fields to change. Omitted fields remain
unchanged.

### Public list filters

- `category` matches the category value exactly.
- `search` is trimmed and compared case-insensitively with `companyName` and
  `products.name`.
- Search text is escaped before it is used as a regular expression, so
  characters such as `.` and `*` are treated as literal search text.
- Only profiles with `approvalStatus: "approved"` appear in public list and
  detail results.

Example: `GET /api/exhibitors?category=food&search=tea`

## Logo upload

Logo upload is configured in
[`../utils/upload.js`](../utils/upload.js):

- The request must use `multipart/form-data` and a single file field named
  `logo`.
- Multer holds the file in memory until validation is performed.
- Only one file is accepted, with a maximum size of 2 MiB.
- The file's actual header bytes are checked. JPEG, PNG, and WebP are accepted;
  the original filename and extension are not trusted.
- Accepted files are stored under `server/uploads/logos` using a generated
  UUID filename.
- The profile stores a URL path such as `/uploads/logos/<uuid>.webp`.
- `app.js` serves this directory publicly at `/uploads/logos`.
- When replacing a logo, the new logo is saved and the profile is updated
  before the previous logo is removed.

An absent file returns 400. Unsupported image bytes return 400. Multer errors,
including the configured file-size limit, are mapped to HTTP 400 by the shared
error middleware.

## Controller functions and why they are used

Functions are defined in
[`../controllers/exhibitorController.js`](../controllers/exhibitorController.js):

- `pickProfileFields(body)` returns only the fields an exhibitor is allowed to
  set through profile create/update requests. This protects ownership, logo,
  and approval fields from client-supplied changes.
- `checkProducts(res, products)` rejects a provided `products` value if it is
  not an array.
- `escapeRegex(text)` escapes regular-expression metacharacters in user search
  input, allowing literal, case-insensitive search rather than interpreting
  user text as a regular expression.
- `findMyProfile(req, res)` locates the profile using the logged-in user's ID
  and returns 404 when that user has not created one.
- `createExhibitor(req, res)` validates the products shape, prevents a second
  profile for the same user, and creates a profile using the authenticated
  user's ID.
- `getMyExhibitor(req, res)` returns the authenticated exhibitor's own profile.
- `updateMyExhibitor(req, res)` loads the current profile, applies only the
  supplied allowlisted fields, and saves it so Mongoose validation runs.
- `uploadMyLogo(req, res)` saves the validated upload, updates the profile,
  removes the previous logo, and returns the updated profile.
- `getExhibitors(req, res)` builds the approved-only public query, applies
  optional category and search filters, omits `userId`, and sorts by company
  name.
- `getExhibitorById(req, res)` validates the profile ID, returns an approved
  profile without `userId`, and reports 404 otherwise.
- `getAllExhibitorsForAdmin(req, res)` lists all profiles for moderation,
  populates the owner's name and email, and sorts newest first. An unrecognized
  approval filter is ignored.
- `updateApprovalStatus(req, res)` validates the requested status and profile
  ID, persists the admin's change, and returns the updated profile.

The controller reuses `fail`, `checkValidId`, and `applyFields` from
[`../utils/fail.js`](../utils/fail.js) to produce HTTP errors, validate MongoDB
IDs, and update only fields that were provided.

## Route protection and middleware

In [`../routes/exhibitorRoutes.js`](../routes/exhibitorRoutes.js):

- Public `GET /` and `GET /:id` do not require login.
- Exhibitor profile and logo endpoints run `protect` followed by
  `authorizeRoles("exhibitor")`.
- Admin list and status endpoints run `protect` followed by
  `authorizeRoles("admin")`.
- `protect` must run first because role authorization checks the authenticated
  `req.user`.
- On logo upload, authentication and the exhibitor-role check happen before
  Multer processes the file.

## Current implementation note

`checkValidId` is imported by the controller from `utils/fail.js`. In the
current helper source, it calls `mongoose.isValidObjectId` but `mongoose` is not
imported in that file. As a result, routes that call `checkValidId` may raise a
`ReferenceError` instead of returning the documented invalid-ID 400 response.
The helper needs a Mongoose import for that validation to work as intended.
