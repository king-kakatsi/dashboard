# Gateway Diagrams

## Reading order

```text
1. Use case diagram first for who uses the gateway and why.
2. Module context flowchart next for where the gateway sits.
3. Data flow flowchart next for how requests and headers move.
4. Activity diagram next for the error mapping decision.
5. Interaction flowcharts next for single calls and fan out.
6. Sequence diagrams last for exact step order over time.
```

## Diagram purposes

```text
1. Use case diagram in README shows actors and goals such as opening the dashboard and managing connectors.
2. Module context in README shows client, guard, controller, service, and downstream service links.
3. Data flow flowchart in DATA_FLOW shows header building and downstream round trip.
4. Activity diagram in DATA_FLOW shows the trickiest choice of copying upstream status or returning 503.
5. Single resource interaction flowchart in FUNCTIONS shows controller to wrapper to helper to downstream path.
6. Dashboard fan out interaction flowchart in FUNCTIONS shows parallel connectors and widgets fetches.
7. forwardRequest sequence diagram in CALL_CHAINS shows time ordered forwarding and error mapping.
8. getUserDashboard sequence diagram in CALL_CHAINS shows time ordered parallel fan out and merge.
```

There is no state diagram for this module because the gateway stores no business state. The axios client is created once and requests stay independent.

## Prerequisites

Read the authentication guard first to see where `req.user.id` comes from. Then read the gateway controller for route names, then the gateway service for forwarding and fan out. Read the connectors module next to see what the downstream paths actually do. Deployment note: the gateway enforces authentication, but the downstream connectors service trusts the forwarded user id header, so the downstream port must not be exposed directly.
