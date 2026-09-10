# Features

## Feature Overview

| Area | Feature | Status |
|---|---|---|
| Identity | Email registration with verification link | [Implemented] |
| Identity | Login with httpOnly session cookie | [Implemented] |
| Identity | Google and GitHub OAuth login | [Implemented] |
| Identity | Password change and two-step email change | [Implemented] |
| Identity | Admin user list, edit, and delete | [Implemented] |
| Catalog | Browse connectors and their widgets | [Implemented] |
| Catalog | Activate and deactivate per user | [Implemented] |
| Catalog | Live widget fetch with query params | [Implemented] |
| Catalog | Generic fetch proxy with RSS and Gmail HTML views | [Implemented] |
| Workspace | macOS-style dock with multi-window widgets | [Implemented] |
| Workspace | Auto-refresh polling with per-widget rates | [Implemented] |
| Workspace | GitHub repos, stars, and sports news widgets | [Implemented] |
| Workspace | Drag and drop layout plus custom themes | [Planned] |
| Workspace | Connector marketplace and saved layouts | [Planned] |
| Platform | WebSocket notifications and team workspaces | [Planned] |
| Platform | Mobile app and no-code connector builder | [Planned] |

Each feature is a short slice: a route, a service method, and a UI state. Admin-only paths reuse the same role guard as the user list.

```mermaid
flowchart TD
    Visitor[Visitor] --> Register[Register with email]
    Register --> Verify[Confirm verification email]
    Verify --> Login[Login and get session]
    Login --> Browse[Browse connector catalog]
    Browse --> Activate[Activate connectors]
    Activate --> OpenApp[Open dock window]
    OpenApp --> ReadWidget[Read live widget data]
    ReadWidget --> Manage[Manage profile and widgets]
```

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Client
    participant A as Auth API
    participant C as Catalog API
    U->>UI: Register
    UI->>A: POST auth register
    A->>U: Verification email
    U->>UI: Confirm link
    UI->>A: Confirm email
    U->>UI: Login
    UI->>A: POST auth login
    U->>UI: Activate connector
    UI->>C: POST activate userId
    U->>UI: Open widget
    UI->>C: GET widget fetch
    C->>UI: Live data
```
