# Project Tree

Real repository structure (generated 2026-09-10). Runtime code only; `node_modules`, `dist`, `coverage`, `.git`, and `.hidden` are omitted. Each service owns its `package.json`; the root one is a placeholder.

```text
dashboard/
├── README.md                      # overview and quick start (this doc index)
├── LICENSE.txt                    # MIT license
├── package.json                   # root placeholder (react only)
├── auth-service/                  # NestJS identity API, port 3001
│   ├── Dockerfile                 # multi-stage, non-root runtime
│   ├── .env.example               # all required variables documented
│   ├── prisma/schema.prisma       # MongoDB User model + enums
│   ├── lib/prisma.ts              # PrismaClient singleton
│   └── src/
│       ├── main.ts                # helmet, cookieParser, strict pipe, env check
│       ├── app.module.ts          # throttler, mailer, feature modules
│       ├── app.controller.ts      # Hello World + GET /health
│       ├── auth/                  # register, login, OAuth, guards, JWT
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   ├── guards/            # CustomAuthGuard, RolesGuard
│       │   ├── decorators/        # CurrentUser, Roles
│       │   ├── dto/               # RegisterDto, LoginDto, AuthResponseDto
│       │   └── strategies/        # jwt, google, github
│       ├── users/                 # profiles, email-change flow, admin CRUD
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.module.ts
│       │   └── dto/               # update-user, update-password, responses
│       ├── gateway/               # proxy to connectors-service + X-User-Id
│       │   ├── gateway.controller.ts
│       │   ├── gateway.service.ts
│       │   └── gateway.module.ts
│       ├── common/utils/          # EmailTemplateUtil
│       └── email-templates/       # verificationEmail, updateConfirmation
├── connectors-service/            # NestJS catalog API, port 3000
│   ├── Dockerfile
│   ├── .env.example
│   ├── index.js / about.js        # legacy Epitech about.json server (:8080)
│   ├── scripts/seed.ts            # idempotent catalog seed (npm run seed)
│   └── src/
│       ├── main.ts                # CORS, strict pipe, env check, helmet
│       ├── app.module.ts          # config, throttler, database, features
│       ├── app.controller.ts      # Hello World + GET /health
│       ├── database/              # Mongoose connection (dbName dashboard)
│       └── modules/
│           ├── connectors/        # CRUD, activate, proxy, DTO, schema
│           │   ├── connectors.controller.ts
│           │   ├── connectors.service.ts
│           │   ├── proxy.controller.ts
│           │   ├── dto/           # create/update connector
│           │   └── schemas/       # Connector (title, baseUrl, userIds)
│           └── widgets/           # CRUD, live fetch, positions, mocks
│               ├── widgets.controller.ts
│               ├── widgets.service.ts
│               ├── google.controller.ts
│               ├── dto/           # create/update widget
│               └── schemas/       # Widget (serviceId, endpoint, userIds)
├── dashboard-client/              # React SPA, Vite dev :5173, nginx :80
│   ├── Dockerfile / nginx.conf    # static build + SPA fallback
│   ├── .env.example               # VITE_API_URL, VITE_API_URL_CONNECTOR
│   └── src/
│       ├── App.jsx / main.jsx     # 10 routes, BrowserRouter entry
│       ├── pages/                 # dashboard, auth/*, user/*
│       ├── components/            # user tabs, github/news widgets, Alert
│       ├── controllers/           # domain calls returning [ok, payload]
│       └── services/              # axios instances + localStorage store
└── docs/                          # you are here
    ├── ARCHITECTURE.md / API.md / DEPLOYMENT.md / FEATURES.md
    ├── DATABASE.md / TESTING_STRATEGY.md / PAGE_LISTING.md
    ├── CHARTS_PROVIDER.md / INSTALLATION.md
    ├── architecture/PROJECT_TREE.md
    ├── modules/{auth,users,gateway,connectors,widgets,client}/
    │   └── README.md DATA_FLOW.md FUNCTIONS.md CALL_CHAINS.md DIAGRAMS.md
    ├── user-guides/{ui,api}/
    └── screenshots/
```

Top-level roles: `auth-service` owns identity and guards every private call; `connectors-service` owns the public catalog and live third-party fetching; `dashboard-client` is the only UI and talks to both APIs; `docs` is this documentation set.
