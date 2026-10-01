import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class HealthCheckEmailOAuth2Api implements ICredentialType {
  name = "healthcheckemailOAuth2Api";
  displayName = "HealthCheckEmail OAuth2 API";
  documentationUrl =
    "https://github.com/HealthCheckEmail/n8n-nodes-healthcheckemail#authentication";
  icon = {
    light: "file:healthcheckemail.svg",
    dark: "file:healthcheckemail.svg",
  } as const;
  extends = ["oAuth2Api"];
  properties: INodeProperties[] = [
    {
      displayName: "Use Dynamic Client Registration",
      name: "useDynamicClientRegistration",
      type: "hidden",
      default: true,
    },
    {
      displayName: "Server URL",
      name: "serverUrl",
      type: "hidden",
      default: "https://mcp.healthcheckemail.com/v1",
    },
    {
      displayName: "Resource URL",
      name: "resourceUrl",
      type: "hidden",
      default: "https://mcp.healthcheckemail.com/v1",
    },
  ];
}
