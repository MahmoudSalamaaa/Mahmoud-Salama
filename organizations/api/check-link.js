import dns from 'node:dns/promises';
import net from 'node:net';

const BLOCKED_HOSTS=new Set(['localhost','localhost.localdomain','metadata.google.internal']);
function isPrivateIP(ip){
  if(net.isIP(ip)===4){const p=ip.split('.').map(Number);return p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===100&&p[1]>=64&&p[1]<=127)||p[0]>=224}
  if(net.isIP(ip)===6){const x=ip.toLowerCase();return x==='::1'||x==='::'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe8')||x.startsWith('fe9')||x.startsWith('fea')||x.startsWith('feb')||x.startsWith('ff')}
  return true;
}
async function validateTarget(value){
  let url;try{url=new URL(value)}catch{throw new Error('Invalid URL')}
  if(!['http:','https:'].includes(url.protocol))throw new Error('Only HTTP and HTTPS URLs are allowed');
  const host=url.hostname.toLowerCase();if(BLOCKED_HOSTS.has(host)||host.endsWith('.local'))throw new Error('Blocked hostname');
  const addresses=net.isIP(host)?[{address:host}]:await dns.lookup(host,{all:true,verbatim:true});
  if(!addresses.length||addresses.some(x=>isPrivateIP(x.address)))throw new Error('Private or unsafe network target blocked');
  return url;
}
async function request(url,method){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{return await fetch(url,{method,redirect:'manual',signal:controller.signal,headers:{'user-agent':'Mahmoud-Salama-Career-Link-Checker/1.0','accept':'text/html,application/xhtml+xml'}})}finally{clearTimeout(timer)}
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const initial=await validateTarget(req.body?.url);let current=initial,response,redirects=0;
    while(redirects<=5){
      try{response=await request(current,'HEAD');if(response.status===405||response.status===403)response=await request(current,'GET')}catch(error){if(error.name==='AbortError')return res.status(200).json({state:'Timeout',statusCode:null,finalUrl:current.href,checkedAt:new Date().toISOString()});throw error}
      if([301,302,303,307,308].includes(response.status)){
        const location=response.headers.get('location');if(!location)break;
        current=await validateTarget(new URL(location,current).href);redirects++;continue;
      }
      break;
    }
    const code=response?.status||null,state=code>=200&&code<400?(redirects?'Redirected':'Working'):code===401||code===403?'Restricted':code>=400?'Broken':'Unknown';
    res.setHeader('Cache-Control','no-store');return res.status(200).json({state,statusCode:code,redirects,finalUrl:current.href,checkedAt:new Date().toISOString()});
  }catch(error){return res.status(400).json({error:error.message||'Link check failed'})}
}
