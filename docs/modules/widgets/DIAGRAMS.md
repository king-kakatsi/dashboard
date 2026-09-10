# Widgets Diagrams

## Reading order

1. Use-case overview in `docs/modules/widgets/README.md`: start here to learn what a dashboard user can do with widgets.
2. Module context flowchart in `docs/modules/widgets/README.md`: read second to see how the client, controller, service, MongoDB, connector record, external API, and stubs connect.
3. CRUD interaction flowchart in `docs/modules/widgets/FUNCTIONS.md`: read third to follow create, read, update, and delete calls into the widget collection.
4. Fetch and membership interaction flowchart in `docs/modules/widgets/FUNCTIONS.md`: read fourth to separate the external fetch path from position and subscription updates.
5. Data-flow flowchart in `docs/modules/widgets/DATA_FLOW.md`: read fifth to trace request validation through MongoDB into shaped responses.
6. Fetch URL composition activity flow in `docs/modules/widgets/DATA_FLOW.md`: read sixth to understand the trickiest transformation step by step.
7. `fetchWidgetData` sequence in `docs/modules/widgets/CALL_CHAINS.md`: read seventh to see every participant in the live data call.
8. `updateUserPosition` sequence in `docs/modules/widgets/CALL_CHAINS.md`: read eighth to see how per-user layout state is saved.
9. `activateForUser` sequence in `docs/modules/widgets/CALL_CHAINS.md`: read ninth to see how a subscription is added safely.
10. `deactivateForUser` sequence in `docs/modules/widgets/CALL_CHAINS.md`: read tenth to see how a subscription is removed.

## Diagram purposes

1. `text` — Use-case overview: shows the five user goals in one picture, and it lives in the widgets README.
2. `text` — Module context flowchart: shows the runtime neighbors of the widgets module, and it lives in the widgets README.
3. `text` — CRUD interaction flowchart: shows which handlers reach the widget collection, and it lives in the widgets FUNCTIONS file.
4. `text` — Fetch and membership interaction flowchart: shows why fetch fans out to an outside API while membership stays local, and it lives in the widgets FUNCTIONS file.
5. `text` — Data-flow flowchart: shows validation, service work, persistence, and response shaping, and it lives in the widgets DATA_FLOW file.
6. `text` — Fetch URL composition activity flow: shows the exact order of URL checks and the outbound call, and it lives in the widgets DATA_FLOW file.
7. `text` — Fetch sequence: shows message order across client, controller, service, database, and outside API, and it lives in the widgets CALL_CHAINS file.
8. `text` — Position sequence: shows message order for per-user layout saves, and it lives in the widgets CALL_CHAINS file.
9. `text` — Activate sequence: shows message order for adding a user subscription, and it lives in the widgets CALL_CHAINS file.
10. `text` — Deactivate sequence: shows message order for removing a user subscription, and it lives in the widgets CALL_CHAINS file.

## Prerequisites

- Read the widgets README before the FUNCTIONS file, because endpoint names only make sense after the module context.
- Read the widgets DATA_FLOW file before CALL_CHAINS, because the sequence diagrams assume you know the fetch envelope and state fields.
- Read the connectors module first when `serviceId` population or `baseUrl` behavior is unclear.
- Read the client module after this module when you want to see who calls the fetch, position, activate, and deactivate routes.

```text
Suggested path: widgets README, widgets DATA_FLOW, widgets FUNCTIONS, widgets CALL_CHAINS, client module.
```
