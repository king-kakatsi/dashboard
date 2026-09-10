# Architecture

Dashboard is a widget-management platform built as two NestJS microservices plus a React single-page application. All persistent data lives in MongoDB.

## System overview

```mermaid
flowchart TD
  Client[dashboard-client<br/>React 19 + Vite<br/>:5173] -->|REST + cookies/Bearer| Auth[auth-service<br/>NestJS + Prisma<br/>:3001]
  Client -->|REST + Bearer| Conn[connectors-service<br/>NestJS + Mongoose<br/>:3000]
  Auth -->|axios + X-User-Id| Conn
  Conn -->|OAuth token lookup| Auth
  Auth --> AuthDB[(MongoDB<br/>users)]
  Conn --> ConnDB[(MongoDB<br/>database: dashboard<br/>connectors, widgets)]
  Conn -->|proxy| Ext[External APIs<br/>GitHub, Gmail, News RSS,<br/>OpenWeatherMap]
```

## Services

### auth-service (port 3001)

Owns identity. Responsibilities:

- Local register/login with bcrypt (cost 10) and JWT (`userId`, `email`, `role`, `provider`, 7d expiry) delivered as an `httpOnly` cookie plus JSON body.
- Google/GitHub OAuth via Passport strategies. OAuth access tokens are AES-256-CBC encrypted before storage.
- Email verification (`POST /auth/verify-email/:id`, `GET /auth/confirm-email/:id`) and two-step profile email change (`PUT /users/profile` stages `standByEmail`, `GET /users/confirm-update/:userId` commits it).
- Password change through a validated DTO.
- Role model: `USER`, `ADMIN`. `CustomAuthGuard` accepts Bearer or cookie; `RolesGuard` enforces `@Roles('ADMIN')`.
- `GatewayModule` proxies dashboard/connector/widget calls to the connectors-service, forwarding `X-User-Id`.
- Cross-cutting: `helmet`, global `ThrottlerGuard` (100 req/min) with stricter limits (10 req/min) on register/login, strict global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), fail-fast env check, `GET /health`.

### connectors-service (port 3000)

Owns the catalog. Responsibilities:

- `Connector` documents: `title`, `description`, `icon`, `baseUrl`, `userIds[]`.
- `Widget` documents: `serviceId` (ref Connector), `name`, `endpoint`, `icon`, `refreshRate` (default 300s), `userIds[]`, `positions[{user_id, position{x,y}}]`.
- Live data: `GET /widgets/:id/fetch` composes `baseUrl + endpoint + query` and calls the third-party API server-side (15s timeout).
- `GET /proxy?baseUrl=&endpoint=` is a generic fetch proxy: RSS feeds render as HTML, Gmail calls attach the user's Google OAuth token (fetched from auth-service) and redirect to Google login when absent.
- No local auth guards: every route is public and trusts the `userId` URL parameter. Only the auth-service gateway and the frontend call it, so do not expose this port publicly without adding authentication.
- Cross-cutting: `helmet`, global `ThrottlerGuard`, strict global `ValidationPipe`, fail-fast env check, `GET /health`.

### dashboard-client (port 5173 dev, nginx :80 in Docker)

React SPA with `react-router-dom`. Layers: `pages/` (routes) -> `controllers/` (domain calls) -> `services/` (axios instances + localStorage token store). No global store library: local component state plus `localStorage` keys `access_token` and `user`. API calls return `[ok, payload]` tuples. Two axios instances exist: `axiosService` (auth-service base URL from `VITE_API_URL`) and `connectorsService` (connectors base URL from `VITE_API_URL_CONNECTOR`), plus a small `fetch`-based `apiService` for public catalog reads.

## Request flows

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant A as auth-service
  participant K as connectors-service
  U->>C: POST /register
  C->>A: POST /auth/register
  A->>A: validate DTO, hash password, create user
  A-->>C: 201 + access_token cookie + token JSON
  C->>K: GET /connectors (dock)
  K-->>C: connector list
  U->>C: open connector
  C->>K: GET /widgets/service/:id
  K-->>C: widgets
  U->>C: click widget
  C->>K: GET /widgets/:id/fetch
  K->>K: baseUrl + endpoint + query
  K-->>C: live data
```

## Data model

```mermaid
erDiagram
  USER ||--o{ CONNECTOR : activates
  USER ||--o{ WIDGET : activates
  CONNECTOR ||--o{ WIDGET : owns
  USER {
    string id
    string email
    string username
    string password_hash
    string role
    string provider
    string-array connectedServiceIds
    string-array activeWidgetIds
    boolean verified
  }
  CONNECTOR {
    string id
    string title
    string baseUrl
    string-array userIds
  }
  WIDGET {
    string id
    string serviceId
    string name
    string endpoint
    int refreshRate
    string-array userIds
  }
```

The auth-service `User` keeps `connectedServiceIds`/`activeWidgetIds` as the source for "my dashboard", while the connectors-service keeps mirrored `userIds` arrays on each document. The two copies are updated through separate endpoints and are eventually consistent by convention, not by transaction.
