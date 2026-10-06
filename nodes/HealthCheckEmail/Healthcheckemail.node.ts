import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";
import { executeOperations, type Operation, type ResourceRoute } from "./transport";
import operations from "./operations.json";
import properties from "./properties.json";
import routes from "./routes.json";

export class Healthcheckemail implements INodeType {
  description: INodeTypeDescription = {
    displayName: "HealthCheckEmail",
    name: "healthcheckemail",
    icon: {
      light: "file:healthcheckemail.svg",
      dark: "file:healthcheckemail.svg",
    },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Automate your HealthCheckEmail account",
    defaults: { name: "HealthCheckEmail" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "healthcheckemailOAuth2Api", required: true }],
    properties: properties as INodeProperties[],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return executeOperations(
      this,
      "https://healthcheckemail.com",
      "healthcheckemailOAuth2Api",
      operations as unknown as Operation[],
      routes as Record<string,ResourceRoute>,
    );
  }
}
