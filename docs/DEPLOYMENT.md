# Deployment

## Prerequisites

- Node.js 20+, npm 9+
- MongoDB (local or Atlas). Both services can share one cluster with different databases.
- SMTP credentials for verification emails.

## Environment

Copy each template and fill in real values. Never commit `.env` files.

- `auth-service/.env.example` -> `auth-service/.env`
- `connectors-service/.env.example` -> `connectors-service/.env`
- `dashboard-client/.env.example` -> `dashboard-client/.env`

Both Nest services refuse to start when required variables are missing (`DATABASE_URL`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` for auth-service; `DATABASE_URL` for connectors-service).

Prisma setup (auth-service only):

```bash
cd auth-service
npx prisma generate
npx prisma migrate dev   # or: npx prisma db push
```

Seed the catalog (connectors-service):

```bash
cd connectors-service
npm run seed
```

## Option A: Docker (recommended)

Each subproject has a multi-stage `Dockerfile` and `.dockerignore`. Images run as non-root (backends) and serve the SPA via nginx with an SPA fallback.

```bash
docker build -t dashboard-auth ./auth-service
docker build -t dashboard-connectors ./connectors-service
docker build -t dashboard-client ./dashboard-client

docker run -d --name auth --env-file ./auth-service/.env -p 3001:3001 dashboard-auth
docker run -d --name connectors --env-file ./connectors-service/.env -p 3000:3000 dashboard-connectors
docker run -d --name client -p 8080:80 dashboard-client
```

Health checks: `GET http://localhost:3001/health`, `GET http://localhost:3000/health`, `GET http://localhost:8080/`.

## Option B: Standalone server with PM2

```bash
# auth-service
cd auth-service && npm ci && npx prisma generate && npm run build
pm2 start dist/main.js --name auth-service

# connectors-service
cd connectors-service && npm ci && npm run build
pm2 start dist/main.js --name connectors-service

# frontend (static)
cd dashboard-client && npm ci && npm run build
# serve dist/ with nginx (see dashboard-client/nginx.conf) or any static host
pm2 save && pm2 startup
```

Production env notes: set `NODE_ENV=production` (cookies get `secure`), `FRONTEND_URL` to the public client URL, `CONNECTORS_SERVICE_URL` to the public connectors URL, and distinct `PORT`s. Do not expose connectors-service `:3000` to the public internet without adding authentication: its routes are public and trust `userId` path parameters.

## Verify

1. `npm run build` passes in all three projects.
2. Unit tests pass in both services (106 + 73 tests, ~99% line coverage):
   `npm test` and `npm run test:cov` in each service.
3. Integration tests pass against a local MongoDB replica set
   (the environment ships one on `127.0.0.1:27017`, replica set `rs0`):
   `npm run test:e2e` in each service (auth: 9 tests over real HTTP +
   real MongoDB with `prisma db push` into an isolated `dashboard_auth_e2e`
   database dropped afterwards; connectors: 11 tests over real HTTP +
   in-memory MongoDB plus a local stub API proving live widget fetch and
   proxy passthrough end to end). The mailer is mocked in e2e; everything
   else (bcrypt, JWT, guards, validation, Prisma, Mongoose) is real.
4. `npm run lint` in `dashboard-client` reports 0 errors.
5. Register -> login -> open connector -> fetch widget works in the browser; `/health` on both APIs returns `status: ok`.
