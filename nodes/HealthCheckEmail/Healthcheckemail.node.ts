import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeOperations, type Operation, type ResourceRoute } from './transport';
import operations from './operations.json';
import routes from './routes.json';

export class Healthcheckemail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HealthCheckEmail',
		name: 'healthcheckemail',
		icon: {
			light: 'file:healthcheckemail.svg',
			dark: 'file:healthcheckemail.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Automate your HealthCheckEmail account',
		defaults: { name: 'HealthCheckEmail' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'healthcheckemailOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Alert',
						value: 'alert',
					},
					{
						name: 'Domain',
						value: 'domains',
					},
					{
						name: 'Team Member',
						value: 'team',
					},
				],
				default: 'domains',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Alert',
						value: 'create_alert',
						description:
							'Create an email, HTTPS webhook, or Slack alert for email-health events. Generic webhooks return a signing secret.',
						action: 'Create alert in health check email',
					},
					{
						name: 'Delete Alert',
						value: 'delete_alert',
						description: 'Permanently delete an alert from a monitored domain',
						action: 'Delete alert in health check email',
					},
					{
						name: 'List Alerts',
						value: 'list_alerts',
						description: 'List configured email, webhook, and Slack alerts for a monitored domain',
						action: 'List alerts in health check email',
					},
					{
						name: 'Test Alert',
						value: 'test_alert',
						description: 'Send a synthetic test notification through an existing alert channel',
						action: 'Test alert in health check email',
					},
					{
						name: 'Update Alert',
						value: 'update_alert',
						description: "Update an alert's target, event rules, label, or enabled state",
						action: 'Update alert in health check email',
					},
				],
				default: 'create_alert',
				displayOptions: {
					show: {
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Domain',
						value: 'add_domain',
						description:
							'Add a domain to HealthCheckEmail monitoring. Returns its DMARC reporting address and the exact suggested DNS record.',
						action: 'Add domain in health check email',
					},
					{
						name: 'Disable Public Status',
						value: 'disable_public_status',
						description:
							"Disable a domain's public email-health status page and invalidate its public URL",
						action: 'Disable public status in health check email',
					},
					{
						name: 'Enable Public Status',
						value: 'enable_public_status',
						description:
							'Enable the shareable public email-health status page and badge for a domain. Returns the generated URLs.',
						action: 'Enable public status in health check email',
					},
					{
						name: 'Get Domain',
						value: 'get_domain',
						description:
							'Get one monitored domain, its DMARC setup record, reporting state, and public status configuration',
						action: 'Get domain in health check email',
					},
					{
						name: 'Get Domain Diagnostics',
						value: 'get_domain_diagnostics',
						description:
							'Analyze mail flow for a domain: daily pass/fail volume, report providers, subdomains, geography, sending sources, unknown senders, and DKIM selectors',
						action: 'Get domain diagnostics in health check email',
					},
					{
						name: 'Get Domain Health',
						value: 'get_domain_health',
						description:
							'Get the latest email health grade, grade history, protected-message counters, compliance checks, recent events, and detected mail provider',
						action: 'Get domain health in health check email',
					},
					{
						name: 'Get Email Infrastructure',
						value: 'get_email_infrastructure',
						description:
							'Get recent SPF, DKIM, DMARC, MX, BIMI, MTA-STS, and DNSSEC snapshots plus the detected mail provider',
						action: 'Get email infrastructure in health check email',
					},
					{
						name: 'Get Enforcement Readiness',
						value: 'get_enforcement_readiness',
						description:
							'Simulate moving this domain to an enforcing DMARC policy and identify legitimate senders that would fail alignment',
						action: 'Get enforcement readiness in health check email',
					},
					{
						name: 'List Domains',
						value: 'list_domains',
						description:
							'List all domains monitored by this HealthCheckEmail account, including setup status and public status URLs',
						action: 'List domains in health check email',
					},
					{
						name: 'Verify Domain',
						value: 'verify_domain',
						description:
							"Check live DNS for the domain's DMARC record and verify that reports are routed to HealthCheckEmail. Returns actionable failure details when setup is incomplete.",
						action: 'Verify domain in health check email',
					},
				],
				default: 'list_domains',
				displayOptions: {
					show: {
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Invite Team Member',
						value: 'invite_team_member',
						description:
							'Invite a person to this HealthCheckEmail account. Only account owners can invite members or other owners.',
						action: 'Invite team member in health check email',
					},
					{
						name: 'List Team Members',
						value: 'list_team_members',
						description:
							'List people with access to this HealthCheckEmail account and their owner/member roles',
						action: 'List team members in health check email',
					},
					{
						name: 'Remove Team Member',
						value: 'remove_team_member',
						description:
							'Remove a person from this HealthCheckEmail account. Only account owners can remove members.',
						action: 'Remove team member in health check email',
					},
				],
				default: 'invite_team_member',
				displayOptions: {
					show: {
						resource: ['team'],
					},
				},
			},
			{
				displayName:
					'This operation changes data or may use account credits. Review the inputs and the product permissions before running this workflow.',
				name: 'writeNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'add_domain',
							'create_alert',
							'delete_alert',
							'disable_public_status',
							'enable_public_status',
							'invite_team_member',
							'remove_team_member',
							'test_alert',
							'update_alert',
							'verify_domain',
						],
						resource: ['alert', 'domains', 'team'],
					},
				},
			},
			{
				displayName: 'Confirm Write Operation',
				name: 'confirmWrite',
				type: 'boolean',
				default: false,
				description:
					'Whether you authorize this workflow to run the selected write operation, including any applicable product credits',
				displayOptions: {
					show: {
						operation: [
							'add_domain',
							'create_alert',
							'delete_alert',
							'disable_public_status',
							'enable_public_status',
							'invite_team_member',
							'remove_team_member',
							'test_alert',
							'update_alert',
							'verify_domain',
						],
						resource: ['alert', 'domains', 'team'],
					},
				},
			},
			{
				displayName: 'Domain',
				name: 'add_domain__domain',
				type: 'string',
				default: '',
				required: true,
				description: 'A root domain such as example.com',
				displayOptions: {
					show: {
						operation: ['add_domain'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'create_alert__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'The domain ID for this operation',
				displayOptions: {
					show: {
						operation: ['create_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Channel',
				name: 'create_alert__channel',
				type: 'options',
				default: 'email',
				required: true,
				description: 'The channel for this operation',
				options: [
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
					{
						name: 'Slack',
						value: 'slack',
					},
				],
				displayOptions: {
					show: {
						operation: ['create_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Target',
				name: 'create_alert__target',
				type: 'string',
				default: '',
				required: true,
				description: 'Email address or HTTPS webhook URL',
				displayOptions: {
					show: {
						operation: ['create_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_alert',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_alert'],
						resource: ['alert'],
					},
				},
				options: [
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						description: 'The label for this operation',
					},
					{
						displayName: 'Rules',
						name: 'rules',
						type: 'json',
						default: '[]',
						description: 'The rules for this operation',
					},
				],
			},
			{
				displayName: 'Domain ID',
				name: 'delete_alert__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'The domain ID for this operation',
				displayOptions: {
					show: {
						operation: ['delete_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Alert ID',
				name: 'delete_alert__alertId',
				type: 'string',
				default: '',
				required: true,
				description: 'The alert ID for this operation',
				displayOptions: {
					show: {
						operation: ['delete_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'disable_public_status__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['disable_public_status'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'enable_public_status__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['enable_public_status'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'get_domain__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['get_domain'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'get_domain_diagnostics__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'The domain ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_domain_diagnostics'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_get_domain_diagnostics',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['get_domain_diagnostics'],
						resource: ['domains'],
					},
				},
				options: [
					{
						displayName: 'Days',
						name: 'days',
						type: 'number',
						default: 90,
						description: 'The days for this operation',
						typeOptions: {
							minValue: 7,
							maxValue: 365,
							numberPrecision: 0,
						},
					},
				],
			},
			{
				displayName: 'Domain ID',
				name: 'get_domain_health__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['get_domain_health'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'get_email_infrastructure__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['get_email_infrastructure'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'get_enforcement_readiness__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['get_enforcement_readiness'],
						resource: ['domains'],
					},
				},
			},
			{
				displayName: 'Email',
				name: 'invite_team_member__email',
				type: 'string',
				default: '',
				required: true,
				description: 'The email for this operation',
				displayOptions: {
					show: {
						operation: ['invite_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_invite_team_member',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['invite_team_member'],
						resource: ['team'],
					},
				},
				options: [
					{
						displayName: 'Role',
						name: 'role',
						type: 'options',
						default: 'member',
						description: 'The role for this operation',
						options: [
							{
								name: 'Owner',
								value: 'owner',
							},
							{
								name: 'Member',
								value: 'member',
							},
						],
					},
				],
			},
			{
				displayName: 'Domain ID',
				name: 'list_alerts__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['list_alerts'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Member ID',
				name: 'remove_team_member__memberId',
				type: 'string',
				default: '',
				required: true,
				description: 'The member ID for this operation',
				displayOptions: {
					show: {
						operation: ['remove_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'test_alert__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'The domain ID for this operation',
				displayOptions: {
					show: {
						operation: ['test_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Alert ID',
				name: 'test_alert__alertId',
				type: 'string',
				default: '',
				required: true,
				description: 'The alert ID for this operation',
				displayOptions: {
					show: {
						operation: ['test_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Domain ID',
				name: 'update_alert__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'The domain ID for this operation',
				displayOptions: {
					show: {
						operation: ['update_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Alert ID',
				name: 'update_alert__alertId',
				type: 'string',
				default: '',
				required: true,
				description: 'The alert ID for this operation',
				displayOptions: {
					show: {
						operation: ['update_alert'],
						resource: ['alert'],
					},
				},
			},
			{
				displayName: 'Update Fields',
				name: 'options_update_alert',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['update_alert'],
						resource: ['alert'],
					},
				},
				options: [
					{
						displayName: 'Enabled',
						name: 'enabled',
						type: 'boolean',
						default: false,
						description: 'Whether the enabled for this operation',
					},
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						description: 'The label for this operation',
					},
					{
						displayName: 'Rules',
						name: 'rules',
						type: 'json',
						default: '[]',
						description: 'The rules for this operation',
					},
					{
						displayName: 'Target',
						name: 'target',
						type: 'string',
						default: '',
						description: 'The target for this operation',
					},
				],
			},
			{
				displayName: 'Domain ID',
				name: 'verify_domain__domainId',
				type: 'string',
				default: '',
				required: true,
				description: 'Domain ID returned by list_domains or add_domain',
				displayOptions: {
					show: {
						operation: ['verify_domain'],
						resource: ['domains'],
					},
				},
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeOperations(
			this,
			'https://healthcheckemail.com',
			'healthcheckemailOAuth2Api',
			operations as unknown as Operation[],
			routes as Record<string, ResourceRoute>,
		);
	}
}
