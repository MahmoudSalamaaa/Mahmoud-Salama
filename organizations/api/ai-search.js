import OpenAI from 'openai';

const schema={
  type:'object',additionalProperties:false,required:['summary','interpretation','ranked'],
  properties:{
    summary:{type:'string'},interpretation:{type:'string'},
    ranked:{type:'array',maxItems:50,items:{type:'object',additionalProperties:false,required:['id','reasons','gaps'],properties:{id:{type:'string'},reasons:{type:'array',items:{type:'string'},maxItems:4},gaps:{type:'array',items:{type:'string'},maxItems:3}}}}
  }
};

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI service is not configured',fallback:true});
  try{
    const {query,candidates,language='en'}=req.body||{};
    if(typeof query!=='string'||!query.trim()||query.length>1000)return res.status(400).json({error:'A valid query is required'});
    if(!Array.isArray(candidates)||!candidates.length)return res.status(400).json({error:'Candidates are required'});
    const safeCandidates=candidates.slice(0,60).map(c=>({
      id:String(c.id||''),title:String(c.title||'').slice(0,180),subtitle:String(c.subtitle||'').slice(0,180),
      type:String(c.type||'').slice(0,100),country:String(c.country||'').slice(0,100),region:String(c.region||'').slice(0,100),
      availability:String(c.availability||'').slice(0,60),profileMatch:Number(c.profileMatch)||0,notes:String(c.notes||'').slice(0,400),source:String(c.source||'').slice(0,100)
    })).filter(c=>c.id);
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const response=await client.responses.create({
      model:process.env.OPENAI_MODEL||'gpt-5-mini',
      input:[
        {role:'system',content:[{type:'input_text',text:`You are a cautious career-search reranker. Rank only candidates supplied by the application. Never invent a vacancy, URL, employer, requirement, status, salary or deadline. Return every selected candidate using its exact id. Explain matches briefly in ${language==='ar'?'Arabic':'English'}. Treat generated searches and monitoring entries as discovery links, not confirmed vacancies.`}]},
        {role:'user',content:[{type:'input_text',text:JSON.stringify({query,candidates:safeCandidates})}]}
      ],
      text:{format:{type:'json_schema',name:'career_search_ranking',strict:true,schema}}
    });
    const result=JSON.parse(response.output_text);
    const valid=new Set(safeCandidates.map(c=>c.id));
    result.ranked=(result.ranked||[]).filter(x=>valid.has(x.id));
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json(result);
  }catch(error){
    console.error('AI search error',error);
    return res.status(500).json({error:'AI reranking failed',fallback:true});
  }
}
