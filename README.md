# Dashboard

One dock for every service you monitor. Connect integrations, open live widgets, watch them refresh.

Version 0.0.1. License MIT. Stack: React 19 + NestJS 11 + MongoDB.

## Quick Start

```bash
cp auth-service/.env.example auth-service/.env
cp connectors-service/.env.example connectors-service/.env
cp dashboard-client/.env.example dashboard-client/.env
cd auth-service && npm install && npx prisma db push && npm run start:dev
cd connectors-service && npm install && npm run start:dev
cd dashboard-client && npm install && npm run dev
```

Open `http://localhost:5173`, register, confirm your email, activate connectors. Details: `docs/INSTALLATION.md`.

## Key Features

- JWT auth with email verification plus Google and GitHub OAuth
- Connector catalog with one-click activate and deactivate
- Live widgets with configurable auto-refresh and multi-window workspace
- macOS-style dock interface with responsive mobile navigation
- 179 unit and 20 integration tests at about 99 percent line coverage

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4, react-router-dom 7
- Backend: NestJS 11, Prisma 6, Mongoose 8, MongoDB, Passport, Nodemailer
- Quality and ship: Jest, Supertest, mongodb-memory-server, ESLint, Docker, nginx

## Deployment Status

[Standalone Application] — see `docs/INSTALLATION.md` and `docs/DEPLOYMENT.md`.

## Documentation

Start with `docs/ARCHITECTURE.md`, then `docs/FEATURES.md`, `docs/DATABASE.md`, `docs/TESTING_STRATEGY.md`, `docs/PAGE_LISTING.md`, `docs/CHARTS_PROVIDER.md`, `docs/API.md`. Deep dives live in `docs/modules/` (auth, users, gateway, connectors, widgets, client) and usage guides in `docs/user-guides/`.

## License & Contributing

MIT — see `LICENSE.txt`. Use conventional commits and keep `npm test`, `npm run test:e2e`, and `npm run lint` green before pushing.

## Developed By

**Leroi Kakatsi**

- Email: [leroi.kakatsi@epitech.eu](mailto:leroi.kakatsi@epitech.eu)
- WhatsApp: [+233 53 561 0908](https://wa.me/233535610908)
- Portfolio: [king-kakatsi.netlify.app](https://king-kakatsi.netlify.app)
