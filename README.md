# n8n-nodes-healthcheckemail

Connect [**HealthCheckEmail**](https://healthcheckemail.com) to n8n workflows using your own account. This package exposes 18 named operations through the product's authenticated API, with form fields for required inputs and optional fields you choose explicitly.

## Installation

For self-hosted n8n, open **Settings → Community Nodes → Install** and enter `n8n-nodes-healthcheckemail`. On n8n Cloud, installation depends on n8n's community-node verification; npm publication alone does not make a node verified.

Use n8n **2.40.7 or newer**, with OAuth dynamic client registration support. Older installations should upgrade before using this credential.

## Authentication

1. Add the **HealthCheckEmail** node and create a **HealthCheckEmail OAuth2 API** credential.
2. Click **Connect my account**. n8n discovers the product authorization server and registers its own callback automatically.
3. Sign in to your HealthCheckEmail account, check the account and permissions on the consent screen, and approve the connection.
4. Save the credential and select an operation.

No API key, client secret, browser cookie, or access token belongs in a workflow field. n8n stores the OAuth credential and refreshes tokens. Your account roles, ownership checks, available integrations, plan limits and credits still apply. You can revoke the connection in the product's connected-app settings. This node contacts only `https://mcp.healthcheckemail.com/mcp`; the n8n OAuth flow contacts the product's discovered authorization server.

## Operations

| Operation | Access | Purpose |
| --- | --- | --- |
| Add Domain | Write / may use credits | Add a domain to HealthCheckEmail monitoring. Returns its DMARC reporting address and the exact suggested DNS record. |
| Create Alert | Write / may use credits | Create an email, HTTPS webhook, or Slack alert for email-health events. Generic webhooks return a signing secret. |
| Delete Alert | Write / may use credits | Permanently delete an alert from a monitored domain. |
| Disable Public Status | Write / may use credits | Disable a domain's public email-health status page and invalidate its public URL. |
| Enable Public Status | Write / may use credits | Enable the shareable public email-health status page and badge for a domain. Returns the generated URLs. |
| Get Domain | Read | Get one monitored domain, its DMARC setup record, reporting state, and public status configuration. |
| Get Domain Diagnostics | Read | Analyze mail flow for a domain: daily pass/fail volume, report providers, subdomains, geography, sending sources, unknown senders, and DKIM selectors. |
| Get Domain Health | Read | Get the latest email health grade, grade history, protected-message counters, compliance checks, recent events, and detected mail provider. |
| Get Email Infrastructure | Read | Get recent SPF, DKIM, DMARC, MX, BIMI, MTA-STS, and DNSSEC snapshots plus the detected mail provider. |
| Get Enforcement Readiness | Read | Simulate moving this domain to an enforcing DMARC policy and identify legitimate senders that would fail alignment. |
| Invite Team Member | Write / may use credits | Invite a person to this HealthCheckEmail account. Only account owners can invite members or other owners. |
| List Alerts | Read | List configured email, webhook, and Slack alerts for a monitored domain. |
| List Domains | Read | List all domains monitored by this HealthCheckEmail account, including setup status and public status URLs. |
| List Team Members | Read | List people with access to this HealthCheckEmail account and their owner/member roles. |
| Remove Team Member | Write / may use credits | Remove a person from this HealthCheckEmail account. Only account owners can remove members. |
| Test Alert | Write / may use credits | Send a synthetic test notification through an existing alert channel. |
| Update Alert | Write / may use credits | Update an alert's target, event rules, label, or enabled state. |
| Verify Domain | Write / may use credits | Check live DNS for the domain's DMARC record and verify that reports are routed to HealthCheckEmail. Returns actionable failure details when setup is incomplete. |

## Example workflow

Import [the included example](examples/account-check.json), select your credential, and execute the manual trigger. It runs **List Domains** once and outputs the account response. Replace the trigger with a schedule to build a recurring report, then connect a filter, spreadsheet or notification node.

For operations that return IDs, map the returned ID into the required field of a second HealthCheckEmail node. Returned arrays stay inside the response object; use n8n's **Split Out** node when you need one item per record. Pagination fields are exposed only where the product supports them; advance the cursor/page explicitly rather than assuming all records were fetched.

## Writes and account limits

Write operations require **Confirm Write Operation**. Review the inputs before enabling it: every workflow execution may repeat the action, create a draft, change account data, or consume product credits depending on the selected operation. The node does not retry write operations automatically. Use read-only operations for monitoring and deduplicate scheduled workflows that create data. Product authorization remains enforced by the server.

## Error handling

- Reconnect OAuth after an authorization failure or revoked grant.
- Check account permissions and plan limits for forbidden or rate-limited responses.
- Invalid inputs stop the item before sending a request. Product-specific validation remains authoritative.
- **On Error → Continue** returns an error item linked to the original input. Failed MCP tool results are never returned as successful data.
- No passwords, environment variables, or customer data are bundled. No external runtime dependencies are installed by this package.

## Development

```sh
npm ci --ignore-scripts
npm run lint
npm test
```

Releases are built and tested in [GitHub Actions](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail/actions), then published to npm with provenance. Public snapshots use GitHub Actions bot attribution.

## Links

- [Website](https://healthcheckemail.com)
- [Privacy policy](https://healthcheckemail.com/privacy/)
- [Source and issues](https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

MIT licensed. This community integration is not an n8n core node.
