import {createHmac,timingSafeEqual} from 'crypto';
import type {IHookFunctions,INodeType,INodeTypeDescription,IWebhookFunctions,IWebhookResponseData,IHttpRequestMethods} from 'n8n-workflow';
import {NodeConnectionTypes,NodeOperationError} from 'n8n-workflow';
interface Hook {id:string;secret?:string;target?:string;url?:string;enabled?:boolean;status?:string}
async function api(ctx:IHookFunctions,method:IHttpRequestMethods,path:string,body?:object):Promise<{alerts?:Hook[];webhooks?:Hook[];alert?:Hook;webhook?:Hook;signing_secret?:string}> {
 try {const response=await ctx.helpers.httpRequestWithAuthentication.call(ctx,'healthcheckemailOAuth2Api',{method,url:'https://healthcheckemail.com'+path,json:true,disableFollowRedirect:true,timeout:30000,...(body?{body}:{})});return response;}
 catch {throw new NodeOperationError(ctx.getNode(),'Webhook registration failed. Check the connection, account permissions, plan, and selected resource.');}
}
export class HealthCheckEmailTrigger implements INodeType {
 description:INodeTypeDescription={
  displayName:'HealthCheckEmail Trigger',name:'healthcheckemailTrigger',icon:{light:'file:healthcheckemail.svg',dark:'file:healthcheckemail.svg'},group:['trigger'],version:1,subtitle:'Webhook events',description:'Receive signed HealthCheckEmail webhooks',defaults:{name:'HealthCheckEmail Trigger'},inputs:[],outputs:[NodeConnectionTypes.Main],credentials:[{name:'healthcheckemailOAuth2Api',required:true}],
  webhooks:[{name:'default',httpMethod:'POST',responseMode:'onReceived',path:'healthcheckemail-events'}],
  properties:[{displayName:'Domain ID',name:'domainId',type:'string',required:true,default:'',description:'The owned resource whose events should trigger this workflow'},{displayName:'Events',name:'events',type:'multiOptions',required:true,default:['dns_change','dmarc_multi','spike'],options:[{name:'DNS Changed',value:'dns_change'},{name:'Multiple DMARC Records',value:'dmarc_multi'},{name:'DMARC Volume Spike',value:'spike'}],description:'Domain health alerts to receive'},{displayName:'Activating this workflow registers a signed webhook. Deactivating removes only its own subscription. A public HTTPS n8n webhook URL and an eligible product plan are required.',name:'setup',type:'notice',default:''}],
 };
 webhookMethods={default:{
  async checkExists(this:IHookFunctions):Promise<boolean> {
   const state=this.getWorkflowStaticData('node');if(!state.subscriptionId||!state.signingSecret)return false;
   const result=await api(this,'GET',`/v1/domains/${encodeURIComponent(this.getNodeParameter('domainId') as string)}/alerts`);
   return Array.isArray(result.alerts)&&result.alerts.some((hook:Hook)=>hook.id===state.subscriptionId&&hook.target===this.getNodeWebhookUrl('default')&&hook.enabled!==false);
  },
  async create(this:IHookFunctions):Promise<boolean> {
   const url=this.getNodeWebhookUrl('default') as string;
   if(!url.startsWith('https://'))throw new NodeOperationError(this.getNode(),'Configure a public HTTPS webhook URL in n8n before activating this trigger.');
   const result=await api(this,'POST',`/v1/domains/${encodeURIComponent(this.getNodeParameter('domainId') as string)}/alerts`,{channel:'webhook',target:url,label:'n8n workflow',rules:(this.getNodeParameter('events') as string[])});
   const hook=result.alert;if(!hook?.id||!hook.secret)throw new NodeOperationError(this.getNode(),'The API did not return the subscription identifier and signing secret.');
   const state=this.getWorkflowStaticData('node');state.subscriptionId=hook.id;state.signingSecret=hook.secret;state.resourceId=this.getNodeParameter('domainId') as string;return true;
  },
  async delete(this:IHookFunctions):Promise<boolean> {
   const state=this.getWorkflowStaticData('node');if(!state.subscriptionId)return true;
   const prefix=`/v1/domains/${encodeURIComponent(String(state.resourceId))}/alerts`;
   await api(this,'DELETE',prefix+'/'+encodeURIComponent(String(state.subscriptionId)));
   delete state.subscriptionId;delete state.signingSecret;delete state.resourceId;return true;
  },
 }};
 async webhook(this:IWebhookFunctions):Promise<IWebhookResponseData> {
  const req=this.getRequestObject(),res=this.getResponseObject();const state=this.getWorkflowStaticData('node');
  const reject=(status:number)=>{res.status(status).json({success:false});return {noWebhookResponse:true};};
  const signature=req.headers['x-hce-signature'];
  if(typeof signature!=='string'||!/^sha256=[a-f0-9]{64}$/.test(signature)||typeof state.signingSecret!=='string')return reject(401);
  if(!Buffer.isBuffer(req.rawBody))await req.readRawBody();
  if(!Buffer.isBuffer(req.rawBody)||req.rawBody.length>262144)return reject(400);
  const expected=createHmac('sha256',state.signingSecret).update(req.rawBody).digest();
  if(!timingSafeEqual(expected,Buffer.from(signature.slice(7),'hex')))return reject(401);
  let payload;try{payload=JSON.parse(req.rawBody.toString('utf8'));}catch{return reject(400);}
  const time=Date.parse(payload.timestamp);
  if(!Number.isFinite(time)||Math.abs(Date.now()-time)>300000||payload.domainId!==state.resourceId)return reject(401);
  
  res.status(200).json({success:true});return {noWebhookResponse:true,workflowData:[this.helpers.returnJsonArray(payload)]};
 }
}
