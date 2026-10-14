# HealthCheckEmail for n8n

Build workflows with the [HealthCheckEmail](https://healthcheckemail.com) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-healthcheckemail` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **HealthCheckEmail OAuth2 API** credential, select **Connect my account**, sign in to HealthCheckEmail, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://healthcheckemail.com/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x or 2.x:** create a new HealthCheckEmail OAuth2 API credential and reconnect it before running workflows. Version 3 uses the product REST resource at `https://healthcheckemail.com/v1` with its own OAuth audience. Tokens issued for the earlier resource cannot be reused. Inputs retain their names; review the resource JSON and write confirmations before enabling workflows.

## Resources and operations

Choose a **Resource**, then an **Operation**. Only operations and input fields for that resource are shown. Resources: Alert, Domain, Team Member.

### Requests

| Operation                 | HTTP request                                      |
| ------------------------- | ------------------------------------------------- |
| add_domain                | `POST /v1/domains`                                |
| create_alert              | `POST /v1/domains/:domainId/alerts`               |
| delete_alert              | `DELETE /v1/domains/:domainId/alerts/:alertId`    |
| disable_public_status     | `DELETE /v1/domains/:domainId/public-status`      |
| enable_public_status      | `POST /v1/domains/:domainId/public-status`        |
| get_domain                | `GET /v1/domains/:domainId`                       |
| get_domain_diagnostics    | `GET /v1/domains/:domainId/diagnostics`           |
| get_domain_health         | `GET /v1/domains/:domainId/summary`               |
| get_email_infrastructure  | `GET /v1/domains/:domainId/infrastructure`        |
| get_enforcement_readiness | `GET /v1/domains/:domainId/readiness`             |
| invite_team_member        | `POST /v1/team`                                   |
| list_alerts               | `GET /v1/domains/:domainId/alerts`                |
| list_domains              | `GET /v1/domains`                                 |
| list_team_members         | `GET /v1/team`                                    |
| remove_team_member        | `DELETE /v1/team/:memberId`                       |
| test_alert                | `POST /v1/domains/:domainId/alerts/:alertId/test` |
| update_alert              | `PATCH /v1/domains/:domainId/alerts/:alertId`     |
| verify_domain             | `POST /v1/domains/:domainId/verify`               |

## Signed webhook trigger

The **HealthCheckEmail Trigger** registers an event subscription when a workflow activates, checks the stored subscription on subsequent activations, and removes only that subscription when the workflow deactivates. It verifies the provider's HMAC signature against the original request body, checks event freshness and resource ownership, and rejects unsigned or altered payloads. Signing secrets stay in the node's workflow state and are never emitted as event data.

Use a public HTTPS n8n webhook URL. Select an owned domain and its event types. Product plan and role requirements still apply. Testing a trigger temporarily registers its test URL; cleanup removes that subscription when n8n stops listening.

## Workflow behavior

Each input item produces one linked output item with the original response envelope. List operations offer **Return All** or a **Limit** (default 50). The node follows paging tokens internally and combines the result arrays. Single-resource and write operations make one request. Selecting a write operation is sufficient; no extra confirmation checkbox is required. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors omit credentials and raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [HealthCheckEmail/n8n-nodes-healthcheckemail](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail). Report node issues in [GitHub Issues](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail/issues).

Product: [HealthCheckEmail](https://healthcheckemail.com) · [Privacy](https://healthcheckemail.com/privacy/) · [Agent skill](https://github.com/HealthCheckEmail/agent-skill)

MIT license.

## REST API contract

The request origin and OAuth resource are the product API shown above. GET reads a resource, POST creates or runs the selected action, PATCH updates, and DELETE removes the selected owned resource. The node does not forward requests to a protocol server. Authentication, permissions and ownership are enforced before the API executes an operation.

## Release checks (3.2.0)

Resource and Operation definitions are explicit in the TypeScript node source. This minor update preserves API endpoints, credential types and operation identifiers. Every publication must pass Prettier, the official n8n node CLI linter with zero warnings, the runtime tests, and the n8n community package scanner against both TypeScript source and compiled JavaScript. GitHub Actions runs these checks before publishing with npm provenance.

Run `npm ci --ignore-scripts`, `npm test`, and `npm run review` before proposing a release.

## Pagination contract

List Domains, List Alerts and List Team Members return complete owned sets from the API (the backing database queries have no row limit). Return All retains the complete set; Limit truncates the relevant array locally without repeating the request.
