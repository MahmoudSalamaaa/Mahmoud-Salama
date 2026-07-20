import {PROFILE} from './config.js';

function normalizeText(value=''){
  return String(value).toLowerCase().normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g,'')
    .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^\p{L}\p{N}+#.]+/gu,' ').trim();
}

export function profileMatch(record){
  const text=normalizeText([record.title,record.subtitle,record.type,record.region,record.country,record.location,record.notes,record.source,record.recordType].filter(Boolean).join(' '));
  let weighted=0;
  PROFILE.keywords.forEach((keyword,index)=>{if(text.includes(normalizeText(keyword)))weighted+=index<8?1.35:1});
  const existing=String(record.fit||'').toLowerCase();
  const fitBoost=existing==='high'?13:existing==='medium'?6:Number(record.fit)>0?Number(record.fit)*2:0;
  return Math.min(99,Math.round(28+(weighted/PROFILE.keywords.length)*72+fitBoost));
}
