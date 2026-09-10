# API Reference

Base URLs (development): auth-service `http://localhost:3001`, connectors-service `http://localhost:3000`. The frontend should use `VITE_API_URL` and `VITE_API_URL_CONNECTOR`.

Authentication: pass `Authorization: Bearer <token>` or rely on the `access_token` httpOnly cookie (requests must use `credentials: include`). Endpoints marked Auth require it; Admin additionally requires role `ADMIN`.

## auth-service

### Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | no (10/min) | multipart: `email`, `username`, `password`, `passwordConfirmation`, optional `profile` image (max 5MB) | `201 { access_token, user }` |
| POST | `/auth/login` | no (10/min) | `{ email, password }` | `200 { access_token, user }` |
| GET | `/auth/google` | no | OAuth redirect | redirects to Google |
| GET | `/auth/google/callback` | no | OAuth callback | sets cookie, redirects to `{FRONTEND_URL}/auth/callback?token=&id=` |
| GET | `/auth/github` | no | OAuth redirect | redirects to GitHub |
| GET | `/auth/github/callback` | no | OAuth callback | sets cookie, redirects to frontend callback |
| GET | `/auth/me` | Auth | — | current user |
| GET | `/auth/oauth-token` | Auth | — | `{ access_token }` decrypted Google token or `null` |
| POST | `/auth/logout` | Auth | — | `{ message }`, clears cookie |
| POST | `/auth/verify-email/:id` | no | — | sends verification email |
| GET | `/auth/confirm-email/:id` | no | — | verifies user, redirects to `{FRONTEND_URL}/email-confirmed` |
| PUT | `/auth/change-password` | Auth | `{ currentPassword, newPassword }` (min 8 chars, validated) | `{ message }` |

Password rules (register): min 8 chars, at least one lowercase, one uppercase, one digit, one special char from `@$!%*?&`.

### Users

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/users/profile` | Auth | own profile |
| GET | `/users` | Admin | all users |
| GET | `/users/confirm-update/:userId` | Auth | commits staged email/username change |
| GET | `/users/:id` | Auth | any user by id |
| PUT | `/users/profile` | Auth | `{ username }` applies directly; `{ standByEmail }` sends confirmation email |
| PUT | `/users/:id` | Admin | update any user |
| DELETE | `/users/:id` | Admin | delete user |
| POST | `/users/services/:serviceId` | Auth | connect a service |
| DELETE | `/users/services/:serviceId` | Auth | disconnect a service |
| POST | `/users/widgets/:widgetId` | Auth | activate a widget |
| DELETE | `/users/widgets/:widgetId` | Auth | deactivate a widget |

### Gateway (proxied to connectors-service)

All require Auth: `GET /dashboard`, `GET/POST /connectors`, `GET/PUT/DELETE /connectors/:id`, `GET/POST /widgets`, `GET/PUT/DELETE /widgets/:id`, `POST /widgets/:id/refresh`.

### Health

`GET /` returns `Hello World!`. `GET /health` returns `{ status: 'ok', service: 'auth-service', timestamp }`.

## connectors-service

All routes are public (no auth guard). `userId` path parameters are trusted client input.

### Connectors

| Method | Path | Notes |
|---|---|---|
| POST | `/connectors` | `{ title, icon (URL), baseUrl (URL), description?, userIds? }` |
| GET | `/connectors` | all connectors |
| PUT | `/connectors/:id` | partial update |
| DELETE | `/connectors/:id` | `{ message }` |
| GET | `/connectors/user/:userId` | connectors activated by a user |
| POST | `/connectors/:id/activate/:userId` | idempotent activate |
| DELETE | `/connectors/:id/deactivate/:userId` | deactivate |

### Widgets

| Method | Path | Notes |
|---|---|---|
| POST | `/widgets` | `{ serviceId, name, icon (URL), description?, functionName?, endpoint?, refreshRate?, userIds? }` |
| GET | `/widgets` | all widgets with populated `serviceId` |
| GET | `/widgets/user/:userId` | widgets activated by a user |
| GET | `/widgets/service/:serviceId` | widgets of a connector |
| GET | `/widgets/:id` | one widget with populated `serviceId` |
| GET | `/widgets/:id/fetch?key=value` | live call to `baseUrl + endpoint + query` (15s timeout) |
| PUT | `/widgets/:id` | partial update |
| DELETE | `/widgets/:id` | delete |
| PUT | `/widgets/:widgetId/user/:userId/position` | body `{ position: { x, y } }` |
| POST | `/widgets/:id/activate/:userId` | idempotent activate |
| DELETE | `/widgets/:id/deactivate/:userId` | deactivate |
| GET | `/widgets/gmail` | static Gmail example payload |
| GET | `/widgets/translate` | static translate example payload |

### Proxy

| Method | Path | Notes |
|---|---|---|
| GET | `/proxy?baseUrl=&endpoint=` | `baseUrl` must be an `http(s)` URL. News RSS returns HTML, Gmail returns HTML (redirects to Google login when no OAuth token), anything else returns JSON passthrough |
| GET | `/proxy/callback?code=` | Google OAuth code exchange, redirects to `FRONTEND_URL` |

### Health

`GET /` returns `Hello World!`. `GET /health` returns `{ status: 'ok', service: 'connectors-service', timestamp }`.

## Error format

Nest exceptions return `{ statusCode, message, error }`. Auth controller failures return `{ message }`. Frontend services normalize everything to `[ok, payload]` tuples: `result[0] === true` means success.
