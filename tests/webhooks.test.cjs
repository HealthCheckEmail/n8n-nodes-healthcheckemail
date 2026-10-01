const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHmac}=require('node:crypto');
const pkg=require('../package.json');
const Trigger=Object.values(require('../'+pkg.n8n.nodes[1]))[0],trigger=new Trigger();
const slug="healthcheckemail";
const state={subscriptionId:'own-subscription',signingSecret:'test-secret',resourceId:'owned-resource'};
const params={domainId:'owned-resource',projectId:'owned-resource',events:slug==='mcpbackend'?'["*.created"]':['dns_change']};
function hookContext(result){const data={...state},calls=[];return {data,calls,ctx:{getNode:()=>({name:'Trigger',type:'test',typeVersion:1,parameters:{},position:[0,0]}),getWorkflowStaticData:()=>data,getNodeParameter:name=>params[name],getNodeWebhookUrl:()=> 'https://n8n.example/webhook/own',helpers:{httpRequestWithAuthentication:async(c,o)=>{calls.push(o);return result;}}}};}
async function receive({tamper=false,stale=false,foreign=false}={}){
 const timestamp=Date.now()-(stale?600000:0);
 const payload=slug==='directoryz'?{id:'event-id',type:'lead.created'}:{id:'event-id',domainId:foreign?'other-resource':'owned-resource',projectId:foreign?'other-resource':'owned-resource',timestamp:new Date(timestamp).toISOString(),occurredAt:new Date(timestamp).toISOString()};
 const rawBody=Buffer.from(JSON.stringify(payload)),stamp=String(Math.floor(timestamp/1000));
 const hmac=createHmac('sha256',state.signingSecret);if(slug==='directoryz')hmac.update(stamp+'.');hmac.update(rawBody);
 const digest=hmac.digest('hex'),headers=slug==='directoryz'?{'x-directoryz-signature':'v1='+digest,'x-directoryz-timestamp':stamp,'x-directoryz-event-id':foreign?'wrong-id':'event-id'}:{['x-'+(slug==='healthcheckemail'?'hce':'mcpbackend')+'-signature']:'sha256='+digest,'x-mcpbackend-delivery':'event-id'};
 let status;const res={status(code){status=code;return this;},json(){return this;}};
 const ctx={getRequestObject:()=>({headers,rawBody:tamper?Buffer.from('{}'):rawBody}),getResponseObject:()=>res,getWorkflowStaticData:()=>state,helpers:{returnJsonArray:p=>[{json:p}]}};
 const output=await trigger.webhook.call(ctx);return {status,output};
}
test('accepts an authentic fresh event and keeps signing secrets out of output',async()=>{const {status,output}=await receive();assert.equal(status,200);assert(output.workflowData);assert(!JSON.stringify(output).includes(state.signingSecret));});
test('rejects altered payloads, old events, and another subscription resource or event ID',async()=>{for(const bad of [{tamper:true},{stale:true},{foreign:true}]){const {status,output}=await receive(bad);assert.equal(status,401);assert.equal(output.workflowData,undefined);}});
test('activation creates a native subscription and stores the returned signing secret',async()=>{const c=hookContext({alert:{id:'new-id',secret:'new-secret'},webhook:{id:'new-id',secret:'new-secret'},signing_secret:'new-secret'});await trigger.webhookMethods.default.create.call(c.ctx);assert.equal(c.calls[0].method,'POST');assert(c.calls[0].url.includes('/v1/'));assert.equal(c.data.subscriptionId,'new-id');assert.equal(c.data.signingSecret,'new-secret');});
test('deactivation removes only its stored subscription and clears local signing data',async()=>{const c=hookContext({});await trigger.webhookMethods.default.delete.call(c.ctx);assert.equal(c.calls[0].method,'DELETE');assert(c.calls[0].url.endsWith('/own-subscription'));assert.equal(c.data.signingSecret,undefined);});
test('checkExists matches both owned subscription ID and webhook URL',async()=>{const c=hookContext({alerts:[{id:'other-id',target:'https://n8n.example/webhook/own'}],webhooks:[{id:'other-id',url:'https://n8n.example/webhook/own',status:'active'}]});assert.equal(await trigger.webhookMethods.default.checkExists.call(c.ctx),false);});
