# Client Diagrams

## Reading order

1. Use-case overview in `docs/modules/client/README.md`: start here to learn what a visitor can do across auth, board, widgets, sports, GitHub, and account pages.
2. Module context flowchart in `docs/modules/client/README.md`: read second to see how pages, controllers, storage, and the three APIs connect.
3. Data-flow flowchart in `docs/modules/client/DATA_FLOW.md`: read third to follow routes, token guards, tuple calls, renders, and storage updates.
4. Widget click to render activity flow in `docs/modules/client/DATA_FLOW.md`: read fourth to understand the trickiest render branch step by step.
5. Auth and navigation interaction flowchart in `docs/modules/client/FUNCTIONS.md`: read fifth to separate auth backend traffic from connector traffic.
6. Board and widget interaction flowchart in `docs/modules/client/FUNCTIONS.md`: read sixth to see how the board, windows, cards, controllers, and polling widgets nest.
7. WidgetCard click to render sequence in `docs/modules/client/CALL_CHAINS.md`: read seventh to see message order from click to live content.
8. Login submit sequence in `docs/modules/client/CALL_CHAINS.md`: read eighth to see validation, authentication, persistence, and redirect order.
9. Register submit sequence in `docs/modules/client/CALL_CHAINS.md`: read ninth to see local checks before account creation.
10. ServicesTab toggle sequence in `docs/modules/client/CALL_CHAINS.md`: read tenth to see guarded membership updates and local patching.
11. SportsNewsWidget polling sequence in `docs/modules/client/CALL_CHAINS.md`: read eleventh to see repeated fetch ticks and timer resets.

## Diagram purposes

1. `text` — Use-case overview: shows the six visitor goals in one picture, and it lives in the client README.
2. `text` — Module context flowchart: shows the runtime neighbors of the browser client, and it lives in the client README.
3. `text` — Data-flow flowchart: shows the shared route to render pipeline, and it lives in the client DATA_FLOW file.
4. `text` — Widget click activity flow: shows loading, fetch, branch, and error states for one card, and it lives in the client DATA_FLOW file.
5. `text` — Auth interaction flowchart: shows how auth pages reach the auth backend through controllers and storage, and it lives in the client FUNCTIONS file.
6. `text` — Board interaction flowchart: shows how board components reach the connectors backend, and it lives in the client FUNCTIONS file.
7. `text` — WidgetCard sequence: shows click to render message order, and it lives in the client CALL_CHAINS file.
8. `text` — Login sequence: shows submit to redirect message order, and it lives in the client CALL_CHAINS file.
9. `text` — Register sequence: shows validation before creation message order, and it lives in the client CALL_CHAINS file.
10. `text` — Services toggle sequence: shows guarded toggle message order, and it lives in the client CALL_CHAINS file.
11. `text` — Sports polling sequence: shows repeated poll message order, and it lives in the client CALL_CHAINS file.

## Prerequisites

- Read the client README before FUNCTIONS, because route and storage facts explain every controller call.
- Read the client DATA_FLOW file before CALL_CHAINS, because the tuple shape and localStorage keys recur in all five sequences.
- Read the widgets module before the WidgetCard and SportsNewsWidget chains when fetch endpoint behavior is unclear.
- Read the auth backend docs before the login and register chains when status codes or token shapes are unclear.

```text
Suggested path: client README, client DATA_FLOW, client FUNCTIONS, client CALL_CHAINS, widgets module.
```
