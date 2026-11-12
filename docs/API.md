# CampusConnect REST API

Base URL for local development: `http://localhost:5000/api`

JSON requests should use `Content-Type: application/json`. Protected endpoints require `Authorization: Bearer <token>`. Tokens are returned by authentication endpoints and expire after two hours.

## Health

### `GET /health`
Checks whether the API process is running and reports the MongoDB connection state.

Example response:
```json
{"status":"ok","service":"CampusConnect API","database":"connected","timestamp":"2026-10-12T10:00:00.000Z"}
```

## Authentication

### `POST /auth/register`
Creates a student account. Passwords are hashed with bcrypt before being stored.

Request:
```json
{"name":"Nikhil Student","email":"nikhil@example.com","password":"strong-demo-password"}
```
Success: `201 Created`
```json
{"user":{"id":"...","name":"Nikhil Student","email":"nikhil@example.com","role":"student"},"token":"<jwt>"}
```
Errors: `400` validation error, `409` email already exists.

### `POST /auth/login`
Request:
```json
{"email":"nikhil@example.com","password":"strong-demo-password"}
```
Success: `200 OK` with `user` and `token`. Invalid credentials return `401 Unauthorized`.

## Events

### `GET /events`
Returns events sorted by date.
- Optional `?category=Technology`
- Optional `?q=buildathon`

Success: `200 OK`, JSON array of event objects.

### `GET /events/:id`
Returns one event. `404` if not found; `400` for malformed MongoDB ID.

### `POST /events/:id/register` 🔒
Requires a JWT. Toggles the current user's registration: first request registers, the next cancels.
- `201 Created`: registered successfully
- `200 OK`: registration cancelled
- `401 Unauthorized`: missing/invalid token
- `404 Not Found`: event or user not found
- `409 Conflict`: event has reached capacity

Example:
```http
POST /api/events/671a00000000000000000001/register
Authorization: Bearer <jwt>
```

## Clubs

### `GET /clubs`
Returns the club directory.

### `POST /clubs/:id/join` 🔒
Requires a JWT. Toggles membership for the current user and adjusts the displayed member count.
- `200 OK`: returns `{ "club": {...}, "joined": true }`
- `401 Unauthorized`, `404 Not Found` for invalid session or club ID.

## Study resources

### `GET /resources`
Returns resources. Optional query parameters: `?q=react` and `?subject=Web%20Development`.

### `GET /resources/:id`
Returns a resource and increments its `downloads` counter. `404` if it does not exist.

## HTTP status codes used
| Code | Meaning | Example |
|---|---|---|
| 200 | OK | List returned / cancellation |
| 201 | Created | Account or registration created |
| 400 | Bad Request | Missing required fields or invalid ID |
| 401 | Unauthorized | Missing or invalid JWT |
| 404 | Not Found | Event/club/resource not found |
| 409 | Conflict | Duplicate email or event full |
| 500 | Internal Server Error | Unexpected server issue |

## Architecture note
The frontend tries the REST API first. When API calls fail, the current demo UI falls back to sample data in browser `localStorage`. Demo fallback is intentionally unauthenticated and is not a production security pattern. For a production release, show authentication errors instead of silently falling back for protected actions and use stronger validation, rate limiting, secure token storage, and audit logging.
