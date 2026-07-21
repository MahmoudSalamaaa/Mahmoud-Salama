export const BUILD_DATE = '2026-07-21';
export const VERSION = '9.0.0-opportunity-intelligence';
export const LEGACY_COMMIT = '375dafd01dae682d4711deb26cb677eecc711b56';
export const LEGACY_BASE = `https://raw.githubusercontent.com/MahmoudSalamaaa/Mahmoud-Salama/${LEGACY_COMMIT}/organizations/`;

export const PROFILE = {
  name: 'Mahmoud Salama',
  title: 'Chief Technology & Digital Transformation Officer',
  location: 'Cairo, Egypt',
  yearsExperience: 18,
  website: 'https://mahmoud-salama.vercel.app',
  digitalCard: 'https://mahmoud-salama.vercel.app/digital_card/index.html',
  cv: 'https://mahmoud-salama.vercel.app/CVSalama.pdf',
  linkedin: 'https://www.linkedin.com/in/mahmoud-salama-30249b34/',
  keywords: [
    'digital transformation','enterprise architecture','enterprise systems','systems integration',
    'it governance','healthcare technology','health information systems','data platforms','data warehouse',
    'erp','crm','business intelligence','program delivery','technical leadership','ict leadership',
    'applications management','solution architecture','public sector','government technology',
    'stakeholder management','team leadership','system availability','technology strategy'
  ]
};

export const DATASETS = {
  ngos: {label:'Africa NGOs & Development', labelAr:'منظمات أفريقيا والتنمية', file:'africa-ngos.csv', kind:'directory', target:148, icon:'AF', page:'africa-ngos.html'},
  organizations: {label:'ICT Organizations', labelAr:'جهات وشركات تكنولوجيا المعلومات', file:'organizations.csv', kind:'directory', target:703, icon:'⌘', page:'organizations.html'},
  medical: {label:'Medical & Digital Health', labelAr:'الشركات الطبية والصحة الرقمية', file:'medical-companies.csv', kind:'directory', target:651, icon:'✚', page:'medical-companies.html'},
  recruitment: {label:'Recruitment & Platforms', labelAr:'وكالات ومنصات التوظيف', file:'recruitment-agencies.csv', kind:'directory', target:674, icon:'HR', page:'recruitment-agencies.html'},
  government: {label:'Government Opportunities', labelAr:'بوابات وفرص حكومية', file:'government-jobs.csv', kind:'directory', target:300, icon:'Gov', page:'government-jobs.html'},
  companies: {label:'Private Companies', labelAr:'الشركات الخاصة', file:'private-company-directory.csv', kind:'directory', target:812, icon:'Co', page:'private-company-directory.html'},
  egypt: {label:'Egypt Jobs', labelAr:'وظائف مصر', file:'egypt-vacancies.csv', kind:'job', target:171, icon:'EG', page:'egypt-vacancies.html'},
  gcc: {label:'GCC Jobs', labelAr:'وظائف الخليج', file:'gcc-vacancies.csv', kind:'job', target:530, icon:'GCC', page:'gcc-vacancies.html'},
  remote: {label:'Remote Jobs', labelAr:'الوظائف عن بُعد', file:'remote-jobs.csv', kind:'job', target:467, icon:'◎', page:'remote-jobs.html'},
  jobs: {label:'All Current Jobs', labelAr:'كل الوظائف الحالية', file:'regional-private-companies.csv', kind:'job', target:1507, icon:'Jobs', page:'regional-private-companies.html'},
  platforms: {label:'Verified Job Sources', labelAr:'مصادر البحث الموثوقة', file:'job-search-platforms.csv', kind:'platform', target:95, icon:'SRC', page:'job-search-platforms.html'},
  projects: {label:'Projects & Consulting', labelAr:'المشروعات والاستشارات', file:'project-opportunities.csv', kind:'project', target:390, icon:'RFP', page:'project-opportunities.html'}
};

export const NAV_ITEMS = [
  ['index.html','Home','الرئيسية'],
  ['today.html','Today','اليوم'],
  ['weekly-review.html','Weekly Review','المراجعة الأسبوعية'],
  ['opportunities.html','Opportunity Tracks','مسارات الفرص'],
  ['explore.html','Search All','البحث في الكل'],
  ['africa-ngos.html','Africa NGOs','منظمات أفريقيا'],
  ['regional-private-companies.html','Jobs','الوظائف'],
  ['tracker.html','My Applications','متابعة التقديم']
];

export const SECONDARY_NAV_ITEMS = [
  ['consulting.html','Consulting & EOIs','الاستشارات وطلبات الاهتمام'],
  ['rosters.html','Rosters & Talent Pools','الروستر وقوائم المواهب'],
  ['volunteer-secondments.html','Volunteer & Secondments','التطوع والانتداب'],
  ['requirements.html','Application Requirements','متطلبات التقديم'],
  ['templates.html','Application Templates','قوالب التقديم'],
  ['email-importer.html','Email Alert Importer','استيراد تنبيهات البريد'],
  ['profile-coverage.html','Profile Coverage','تغطية الملف المهني'],
  ['rules.html','Rules Engine','محرك القواعد'],
  ['archive.html','Opportunity Archive','أرشيف الفرص'],
  ['vault.html','Encrypted Vault','الخزنة المشفرة'],
  ['review-queue.html','Review Queue','قائمة المراجعة'],
  ['ats-connectors.html','ATS Connectors','ربط أنظمة التوظيف'],
  ['calendar.html','Calendar','التقويم'],
  ['save-from-web.html','Save from Web','حفظ من الويب'],
  ['version-history.html','Version History','سجل نسخ الوظائف'],
  ['contacts.html','Contacts','جهات الاتصال'],
  ['documents.html','Documents & Snapshots','المستندات واللقطات'],
  ['analytics.html','Application Analytics','تحليلات التقديم'],
  ['quality.html','Data Quality','جودة البيانات'],
  ['africa-map.html','Africa Map','خريطة أفريقيا'],
  ['settings.html','Settings','الإعدادات'],
  ['egypt-vacancies.html','Egypt Jobs','وظائف مصر'],
  ['gcc-vacancies.html','GCC Jobs','وظائف الخليج'],
  ['remote-jobs.html','Remote Jobs','الوظائف عن بُعد'],
  ['medical-companies.html','Medical & Digital Health','الطبي والصحة الرقمية'],
  ['recruitment-agencies.html','Recruitment & Platforms','التوظيف والمنصات'],
  ['government-jobs.html','Government','الحكومي'],
  ['private-company-directory.html','Private Companies','الشركات الخاصة'],
  ['project-opportunities.html','Projects & Consulting','المشروعات والاستشارات'],
  ['platform-search-hub.html','Search Matrix','مصفوفة البحث'],
  ['dashboard.html','Dashboard','لوحة المؤشرات'],
  ['admin.html','Data Manager','إدارة البيانات'],
  ['link-checker.html','Link Checker','فحص الروابط'],
  ['sources.html','Source Intelligence','ذكاء المصادر'],
  ['methodology.html','Methodology & Help','المنهجية والمساعدة']
];

export const JOB_STATUSES = ['Not started','Saved','Job Found','Planning to Apply','Applied','Assessment','Interview','Follow-up','Offer','Rejected','Not Available','Closed'];
export const DIRECTORY_STATUSES = ['Not started','Saved','Job Found','Contacted','Applied','Interview','Not Available','Closed'];
export const AVAILABILITY_STATUSES = ['Open','Closing Soon','Deadline Passed','Needs Verification','Monitoring','Careers Page Available','Official Website Only','Recruitment Through Platform','Status Unknown'];

export const ROLES = [
  'Chief Information Officer','Chief Technology Officer','IT Director','Director of Digital Transformation',
  'Head of Information Systems','Head of Enterprise Applications','Head of Digital Transformation',
  'Enterprise Architect','Solution Architect','Business Architect','Technology Architect','Data Architect',
  'Cloud Architect','Integration Architect','Applications Manager','Enterprise Applications Manager',
  'Systems Manager','Information Systems Manager','IT Operations Manager','Infrastructure Manager',
  'Digital Transformation Manager','Digital Program Manager','Technology Program Manager','IT Program Manager',
  'IT Governance Manager','Data Governance Lead','AI Governance Lead','Cybersecurity Governance Manager',
  'Healthcare IT Manager','Health Information Systems Manager','Digital Health Manager','Medical Technology Manager',
  'ERP Manager','CRM Manager','Business Intelligence Manager','Data Platform Manager','Data Warehouse Manager',
  'Technology Delivery Manager','IT Service Delivery Manager','Technical Project Manager','Program Management Office Lead',
  'Technology Strategy Manager','ICT Manager','Regional IT Manager','Country IT Manager','Technical Team Lead',
  'Enterprise Systems Lead'
];

export const MARKETS = [
  'Egypt','Saudi Arabia','United Arab Emirates','Qatar','Kuwait','Oman','Bahrain','GCC','Middle East',
  'Jordan','Lebanon','Iraq','Morocco','Tunisia','Algeria','Libya','Sudan','Arab Region','North Africa',
  'South Africa','Kenya','Nigeria','Ghana','Rwanda','Uganda','Tanzania','Ethiopia','Senegal','Ivory Coast',
  'West Africa','East Africa','Southern Africa','Africa','Sub-Saharan Africa','EMEA','MEA','Europe','Worldwide','Remote','Global'
];

export const PLATFORM_TEMPLATES = [
  {name:'LinkedIn',url:(r,m)=>`https://www.linkedin.com/jobs/search/?keywords=${enc(r)}&location=${enc(m)}&sortBy=DD`},
  {name:'Indeed',url:(r,m)=>`https://www.indeed.com/jobs?q=${enc(r)}&l=${enc(m)}&sort=date`},
  {name:'Glassdoor',url:(r,m)=>googleSite('glassdoor.com/Job',r,m)},
  {name:'Bayt',url:(r,m)=>`https://www.bayt.com/en/international/jobs/${slug(r)}-jobs/`},
  {name:'GulfTalent',url:(r,m)=>googleSite('gulftalent.com',r,m)},
  {name:'Naukrigulf',url:(r,m)=>googleSite('naukrigulf.com',r,m)},
  {name:'WUZZUF',url:(r,m)=>`https://wuzzuf.net/search/jobs/?q=${enc(r)}&a=hpb`},
  {name:'Careerjet',url:(r,m)=>`https://www.careerjet.com/search/jobs?s=${enc(r)}&l=${enc(m)}`},
  {name:'Jooble',url:(r,m)=>`https://jooble.org/SearchResult?rgns=${enc(m)}&ukw=${enc(r)}`},
  {name:'Jobberman',url:(r,m)=>googleSite('jobberman.com',r,m)},
  {name:'BrighterMonday',url:(r,m)=>googleSite('brightermonday.co.ke',r,m)},
  {name:'Devex',url:(r,m)=>googleSite('devex.com/jobs',r,m)},
  {name:'ReliefWeb',url:(r,m)=>`https://reliefweb.int/jobs?search=${enc(`${r} ${m}`)}`},
  {name:'Google Jobs',url:(r,m)=>`https://www.google.com/search?q=${enc(`${r} jobs ${m}`)}`}
];

function enc(value){return encodeURIComponent(value)}
function slug(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function googleSite(site,role,market){return `https://www.google.com/search?q=${enc(`site:${site} "${role}" "${market}" jobs`)}`}

export const MATRIX_TARGET = 25380;
