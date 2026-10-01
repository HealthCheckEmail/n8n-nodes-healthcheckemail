# HealthCheckEmail for n8n

Build workflows with the [HealthCheckEmail](https://healthcheckemail.com) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-healthcheckemail` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **HealthCheckEmail OAuth2 API** credential, select **Connect my account**, sign in to HealthCheckEmail, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://mcp.healthcheckemail.com/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x:** reconnect the credential before running workflows. Version 2 replaces the old MCP transport with the native REST API. Inputs retain their names, while outputs are the API's resource JSON. Review existing workflows before enabling writes.

## Operations

| Operation | HTTP request |
| --- | --- |
| add_domain | `POST /v1/domains` |
| create_alert | `POST /v1/domains/:domainId/alerts` |
| delete_alert | `DELETE /v1/domains/:domainId/alerts/:alertId` |
| disable_public_status | `DELETE /v1/domains/:domainId/public-status` |
| enable_public_status | `POST /v1/domains/:domainId/public-status` |
| get_domain | `GET /v1/domains/:domainId` |
| get_domain_diagnostics | `GET /v1/domains/:domainId/diagnostics` |
| get_domain_health | `GET /v1/domains/:domainId/summary` |
| get_email_infrastructure | `GET /v1/domains/:domainId/infrastructure` |
| get_enforcement_readiness | `GET /v1/domains/:domainId/readiness` |
| invite_team_member | `POST /v1/team` |
| list_alerts | `GET /v1/domains/:domainId/alerts` |
| list_domains | `GET /v1/domains` |
| list_team_members | `GET /v1/team` |
| remove_team_member | `DELETE /v1/team/:memberId` |
| test_alert | `POST /v1/domains/:domainId/alerts/:alertId/test` |
| update_alert | `PATCH /v1/domains/:domainId/alerts/:alertId` |
| verify_domain | `POST /v1/domains/:domainId/verify` |

## Signed webhook trigger

The **HealthCheckEmail Trigger** registers an event subscription when a workflow activates, checks the stored subscription on subsequent activations, and removes only that subscription when the workflow deactivates. It verifies the provider's HMAC signature against the original request body, checks event freshness and resource ownership, and rejects unsigned or altered payloads. Signing secrets stay in the node's workflow state and are never emitted as event data.

Use a public HTTPS n8n webhook URL. Select an owned domain and its event types. Product plan and role requirements still apply. Testing a trigger temporarily registers its test URL; cleanup removes that subscription when n8n stops listening.

## Workflow behavior

Each input item makes one API request and produces one linked output item. Optional pagination fields can be passed through the node's options; list responses retain their next-page cursor or offset. Write operations require the node's explicit confirmation switch. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors are summarized without including credentials or raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [HealthCheckEmail/n8n-nodes-healthcheckemail](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail). Report node issues in [GitHub Issues](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail/issues).

Product: [HealthCheckEmail](https://healthcheckemail.com) · [Privacy](https://healthcheckemail.com/privacy/) · [Agent skill](https://github.com/HealthCheckEmail/agent-skill) · [MCP integration](https://github.com/HealthCheckEmail/mcp-server)

MIT license.
