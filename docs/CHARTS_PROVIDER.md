# Charts Provider

Central diagram repository. Each entry states its purpose and where it is used. Module deep dives live under `docs/modules/`.

### Module Diagrams

- [Auth Module Diagrams](./modules/auth/DIAGRAMS.md)
- [Users Module Diagrams](./modules/users/DIAGRAMS.md)
- [Gateway Module Diagrams](./modules/gateway/DIAGRAMS.md)
- [Connectors Module Diagrams](./modules/connectors/DIAGRAMS.md)
- [Widgets Module Diagrams](./modules/widgets/DIAGRAMS.md)
- [Client Module Diagrams](./modules/client/DIAGRAMS.md)

### System Architecture

**Purpose**: Major components and their links. **Usage**: `ARCHITECTURE.md`.

```mermaid
flowchart TD
    Browser[React SPA] -->|Bearer and cookie| AuthApi[Auth Service]
    Browser -->|Bearer| CatalogApi[Connectors Service]
    AuthApi -->|Axios plus XUserId| CatalogApi
    AuthApi -->|Prisma| AuthDb[(Auth MongoDB)]
    CatalogApi -->|Mongoose| CatalogDb[(Catalog MongoDB)]
    CatalogApi -->|Proxy and fetch| ThirdParty[External APIs]
```

### Data Flow Diagrams

**Purpose**: Register-to-widget data movement. **Usage**: `FEATURES.md`, module `DATA_FLOW.md` files.

```mermaid
flowchart TD
    Form[Register form] --> AuthApi[Auth API]
    AuthApi --> Hash[Hash password]
    Hash --> SaveUser[Save user]
    SaveUser --> SendMail[Send verify email]
    SendMail --> Token[Issue JWT cookie]
    Token --> Catalog[Load catalog]
    Catalog --> Activate[Activate connector]
    Activate --> FetchWidget[Fetch live widget]
```

### Activity Diagrams

**Purpose**: Branching inside register and proxy flows. **Usage**: module `DATA_FLOW.md` files.

```mermaid
flowchart TD
    Start([Start]) --> Validate[Validate input]
    Validate --> Valid{Valid}
    Valid -->|No| Reject[Return 400]
    Valid -->|Yes| Exists{Already exists}
    Exists -->|Yes| Conflict[Return 409]
    Exists -->|No| Persist[Persist and notify]
    Persist --> Done([Done])
    Reject --> Done
    Conflict --> Done
```

### Use Case Diagrams

**Purpose**: Actors and capabilities per module. **Usage**: module `README.md` files.

```mermaid
flowchart TD
    Visitor([Visitor]) --> Register[Register account]
    Visitor --> Login[Login]
    Member([Member]) --> ManageWidgets[Manage widgets]
    Member --> EditProfile[Edit profile]
    Admin([Admin]) --> ManageUsers[Manage users]
    Register --> AuthModule[Auth module]
    Login --> AuthModule
    ManageWidgets --> CatalogModule[Catalog modules]
    EditProfile --> UsersModule[Users module]
    ManageUsers --> UsersModule
```

### Sequence Diagrams

**Purpose**: Exact call order for login and widget fetch. **Usage**: module `CALL_CHAINS.md` files.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Client
    participant A as Auth API
    participant DB as MongoDB
    U->>UI: Submit login
    UI->>A: POST auth login
    A->>DB: Find user by email
    DB-->>A: User row
    A->>A: Compare bcrypt hash
    A->>A: Sign JWT
    A-->>UI: Token plus cookie
```

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Client
    participant C as Catalog API
    participant T as Third Party
    U->>UI: Click widget
    UI->>C: GET widget fetch
    C->>C: Compose baseUrl plus endpoint
    C->>T: GET live data
    T-->>C: JSON payload
    C-->>UI: Success plus data
```

### Interaction Diagrams

**Purpose**: Static maps of which services call which. **Usage**: module `FUNCTIONS.md` files.

```mermaid
flowchart TD
    GatewayController[Gateway Controller] --> GatewayService[Gateway Service]
    GatewayService --> ConnectorsApi[Connectors API]
    AuthController[Auth Controller] --> AuthService[Auth Service]
    AuthService --> UsersService[Users Service]
    AuthService --> Mailer[Mailer]
    WidgetsController[Widgets Controller] --> WidgetsService[Widgets Service]
    WidgetsService --> ConnectorModel[Connector Model]
```

### State Diagrams

**Purpose**: Account verification and widget activation lifecycles. **Usage**: module `DATA_FLOW.md` files.

```mermaid
stateDiagram-v2
    [*] --> Unverified
    Unverified --> Verified: confirm email link
    Verified --> EmailStaged: stage new email
    EmailStaged --> Verified: confirm update link
```

```mermaid
stateDiagram-v2
    [*] --> Inactive
    Inactive --> Active: activate for user
    Active --> Inactive: deactivate for user
```

### Entity Relationship Diagrams

**Purpose**: Collections and references. **Usage**: `DATABASE.md`.

```mermaid
erDiagram
    USER ||--o{ CONNECTOR : activates
    USER ||--o{ WIDGET : activates
    CONNECTOR ||--o{ WIDGET : owns
```

### Page Hierarchy Maps

**Purpose**: Route navigation. **Usage**: `PAGE_LISTING.md`.

```mermaid
flowchart TD
    Home[Home] --> Profile[Profile]
    Profile --> EditProfile[Edit profile]
    Profile --> ChangePassword[Change password]
    Home --> ConnectorWindow[Connector window]
```

### User Journey Maps

**Purpose**: End-to-end member journey. **Usage**: `FEATURES.md`.

```mermaid
flowchart TD
    Register[Register] --> Verify[Verify email]
    Verify --> Login[Login]
    Login --> Activate[Activate connector]
    Activate --> Watch[Watch live widgets]
```

### Deployment Diagrams

**Purpose**: Images to running containers. **Usage**: `DEPLOYMENT.md`.

```mermaid
flowchart TD
    BuildImages[Build three images] --> PushDb[Push Prisma schema]
    PushDb --> StartApis[Start auth and connectors]
    StartApis --> StartUi[Start client]
    StartUi --> Health[Probe health endpoints]
```
