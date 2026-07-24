#!/usr/bin/env python3
"""Maintain the Career Intelligence data layer.

Supported safe inputs:
- CSV files placed in automation/imports/
- Public/authorized JSON or RSS adapters added to source-adapters.json
- Optional link checks (rate-limited and conservative)

The script merges imports, normalizes fields, removes duplicate jobs, updates
availability for definitively broken links, regenerates catalog/manifest/CSV
exports, and writes a link-check report. It intentionally does not scrape
platforms that prohibit automated access.
"""
from pathlib import Path
from datetime import date
from urllib.parse import urlparse
import argparse,csv,json,re,time,urllib.request,urllib.error
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'data'; IMPORTS=Path(__file__).parent/'imports'; TODAY=date.today().isoformat()
FILES={'job':'verified-jobs.json','company':'companies.json','agency':'agencies.json','government':'government.json','project':'projects.json','platform':'platforms.json','source':'sources.json','live_search':'live-searches.json'}
def load(name):return json.loads((DATA/name).read_text(encoding='utf-8'))
def save(name,obj):(DATA/name).write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
def clean(x):return re.sub(r'\s+',' ',str(x or '')).strip()
def norm(x):return re.sub(r'[^a-z0-9]+',' ',clean(x).lower()).strip()
def key(r):return(norm(r.get('title')),norm(r.get('organization') or r.get('subtitle')),norm(r.get('country')))
def grade(url):
 d=urlparse(clean(url)).netloc.lower()
 if any(x in d for x in ['workable.','greenhouse.','lever.','smartrecruiters.','workday','oraclecloud','ungm.org','.gov','undp.org','unicef.org','who.int','worldbank.org','afdb.org']):return 'A'
 if any(x in d for x in ['linkedin.','indeed.','glassdoor.','bayt.','gulftalent.','wuzzuf.','naukrigulf.']):return 'B'
 if any(x in d for x in ['jooble.','careerjet.','talent.com','jobrapido.','jobsora.']):return 'C'
 return 'B' if d else 'D'
def normalize(row,category,index):
 title=clean(row.get('title')); org=clean(row.get('organization') or row.get('subtitle')); url=clean(row.get('url'))
 availability=clean(row.get('availability_status') or row.get('status')) or ('Possibly Available' if category=='job' else 'Not Verified')
 return {'id':clean(row.get('id')) or f'import-{category}-{index:06d}','record_type':clean(row.get('record_type')) or {'job':'Platform-Indexed Vacancy','company':'Employer Career Page','agency':'Recruitment Agency','government':'Government Portal','project':'Project / Tender','platform':'Job Platform','live_search':'Live Search','source':'Source Directory'}[category],'category':category,'title':title,'organization':org,'subtitle':org,'role_family':clean(row.get('role_family') or row.get('type')),'type':clean(row.get('type')),'region':clean(row.get('region')),'country':clean(row.get('country')),'location':clean(row.get('location')),'availability_status':availability,'published_date':clean(row.get('published_date')),'expiry_date':clean(row.get('expiry_date')),'last_checked':TODAY,'age_days':row.get('age_days') or None,'posted_text':clean(row.get('posted_text') or row.get('posted')),'notes':clean(row.get('notes')),'source':clean(row.get('source')),'url':url,'source_quality':clean(row.get('source_quality')) or grade(url),'source_quality_label':clean(row.get('source_quality_label')),'verification_level':clean(row.get('verification_level')),'sources':[{'name':clean(row.get('source')) or urlparse(url).netloc,'url':url,'quality':grade(url)}] if url else [],'duplicate_count':int(row.get('duplicate_count') or 0),'origin_pages':['automation/imports'],'match':row.get('match') or {'role':50,'seniority':60,'industry':50,'location':70,'technology':50,'overall':56},'match_score':int(row.get('match_score') or 56),'fit':clean(row.get('fit')) or 'Medium'}
def check(url,timeout=12):
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 CareerIntelligence/1.0'})
  with urllib.request.urlopen(req,timeout=timeout) as r:return int(r.status)
 except urllib.error.HTTPError as e:return int(e.code)
 except Exception:return 0
def export_csv(name,rows):
 fields=['id','record_type','category','title','organization','type','region','country','location','availability_status','published_date','expiry_date','last_checked','match_score','fit','source','source_quality','verification_level','url','notes','duplicate_count']
 out=DATA/'csv'/name;out.parent.mkdir(exist_ok=True)
 with out.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows({k:r.get(k,'') for k in fields} for r in rows)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check-links',action='store_true');ap.add_argument('--max-links',type=int,default=250);args=ap.parse_args()
 data={k:load(v) for k,v in FILES.items()}
 imported=0
 for f in IMPORTS.glob('*.csv'):
  if f.name.startswith('_'):continue
  with f.open(encoding='utf-8-sig',newline='') as h:
   for row in csv.DictReader(h):
    category=clean(row.get('category') or 'job').lower()
    if category not in data:continue
    data[category].append(normalize(row,category,len(data[category])+1));imported+=1
 # Dedupe jobs while preserving sources.
 merged={}
 for r in data['job']:
  k=key(r)
  if k not in merged:merged[k]=r
  else:
   old=merged[k];old['duplicate_count']=int(old.get('duplicate_count') or 0)+1
   for s in r.get('sources',[]):
    if s.get('url') not in {x.get('url') for x in old.get('sources',[])}:old.setdefault('sources',[]).append(s)
 data['job']=list(merged.values())
 report=[]
 if args.check_links:
  checked=0
  for category,rows in data.items():
   for r in rows:
    if checked>=args.max_links:break
    if not r.get('url'):continue
    status=check(r['url']);checked+=1;report.append({'record_id':r['id'],'url':r['url'],'http_status':status,'checked':TODAY})
    r['last_checked']=TODAY
    if status in {404,410}:r['availability_status']='Not Available'
    time.sleep(.15)
   if checked>=args.max_links:break
 save('link-check-report.json',report)
 for category,file in FILES.items():save(file,data[category]);export_csv(file.replace('.json','.csv'),data[category])
 catalog=sum(data.values(),[]);save('catalog.json',catalog)
 # Regenerate best-match groups.
 available=[r for r in data['job'] if r.get('availability_status') in {'Available','Possibly Available'}]
 def top(pred=lambda r:True,n=20):return sorted([r for r in available if pred(r)],key=lambda r:-int(r.get('match_score') or 0))[:n]
 best={'overall':top(),'remote':top(lambda r:'remote' in (' '.join([str(r.get('region','')),str(r.get('country','')),str(r.get('location',''))])).lower(),10),'gcc':top(lambda r:any(x in (' '.join([str(r.get('region','')),str(r.get('country',''))])).lower() for x in ['gcc','saudi','united arab emirates','qatar','oman','kuwait','bahrain']),10),'healthcare':top(lambda r:any(x in (' '.join([str(r.get('title','')),str(r.get('type','')),str(r.get('organization','')),str(r.get('notes',''))])).lower() for x in ['health','medical','hospital']),10),'architecture':top(lambda r:'architect' in (' '.join([str(r.get('title','')),str(r.get('type',''))])).lower(),10),'leadership':top(lambda r:any(x in str(r.get('title','')).lower() for x in ['director','head','chief','manager','lead']),10)}
 save('best-matches.json',best)
 # Regenerate core data-quality metrics after imports and deduplication.
 issues=[]
 for r in sum([data[k] for k in ['job','company','agency','government','project','platform','source']],[]):
  if not r.get('title'):issues.append({'severity':'High','type':'Missing title','record_id':r.get('id'),'message':'Record has no title'})
  if not r.get('url'):issues.append({'severity':'High','type':'Missing URL','record_id':r.get('id'),'message':f"{r.get('title','Record')} has no URL"})
  if not r.get('country'):issues.append({'severity':'Medium','type':'Missing country','record_id':r.get('id'),'message':f"{r.get('title','Record')} has no country"})
  if r.get('source_quality')=='D':issues.append({'severity':'Medium','type':'Unverified source','record_id':r.get('id'),'message':f"{r.get('title','Record')} uses an unverified source"})
  if r.get('category')=='job' and not r.get('published_date'):issues.append({'severity':'Medium','type':'Missing publication date','record_id':r.get('id'),'message':f"{r.get('title','Job')} has no normalized publication date"})
 quality={'generated_at':TODAY,'counts':{'jobs':len(data['job']),'verified_vacancies':sum(r.get('record_type')=='Verified Vacancy' for r in data['job']),'platform_indexed_vacancies':sum(r.get('record_type')=='Platform-Indexed Vacancy' for r in data['job']),'live_searches':len(data['live_search']),'companies':len(data['company']),'agencies':len(data['agency']),'government':len(data['government']),'projects':len(data['project']),'platforms':len(data['platform']),'sources':len(data['source']),'duplicates_merged':sum(int(r.get('duplicate_count') or 0) for r in data['job']),'issues':len(issues),'missing_urls':sum(i['type']=='Missing URL' for i in issues),'missing_dates':sum(i['type']=='Missing publication date' for i in issues),'unverified_sources':sum(i['type']=='Unverified source' for i in issues),'old_jobs':sum(1 for r in data['job'] if isinstance(r.get('age_days'),int) and r.get('age_days')>30)},'source_quality':{},'issues':issues[:5000],'duplicate_groups':[{'canonical_id':r.get('id'),'title':r.get('title'),'organization':r.get('organization'),'country':r.get('country'),'duplicates_removed':int(r.get('duplicate_count') or 0),'sources':r.get('sources',[])} for r in data['job'] if int(r.get('duplicate_count') or 0)>0][:2000]}
 for r in catalog:quality['source_quality'][r.get('source_quality','D')]=quality['source_quality'].get(r.get('source_quality','D'),0)+1
 save('data-quality.json',quality)
 manifest=load('manifest.json');manifest['generated_at']=TODAY;manifest['total_records']=len(catalog)
 for category,file in FILES.items():
  keyname={'job':'jobs','company':'companies','agency':'agencies','government':'government','project':'projects','platform':'platforms','source':'sources','live_search':'live_searches'}[category]
  if keyname in manifest['datasets']:manifest['datasets'][keyname]['count']=len(data[category])
 save('manifest.json',manifest)
 print(json.dumps({'imported':imported,'jobs_after_dedupe':len(data['job']),'catalog':len(catalog),'links_checked':len(report)},indent=2))
if __name__=='__main__':main()
