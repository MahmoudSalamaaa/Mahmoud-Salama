const translations = {
  en: {
    theme:'Theme', language:'العربية', search:'Search', explore:'Search All', clear:'Clear', filters:'Filters',
    all:'All', country:'Country / market', region:'Region', type:'Type', fit:'Career fit', status:'Status', dataset:'Category',
    sort:'Sort', bestMatch:'Best fit', newest:'Newest', name:'Name', favorites:'Favorites', saved:'Saved',
    results:'results', openSource:'Open source', track:'Track', details:'Details', lastChecked:'Last checked',
    source:'Source', trust:'Source trust', linkStatus:'Link status', profileMatch:'Career fit',
    availability:'Availability', needsVerification:'Needs Verification', working:'Working', unknown:'Unknown',
    exportCsv:'Export CSV', backup:'Backup', import:'Import', previous:'Previous', next:'Next',
    noResults:'No matching results. Try a broader keyword or clear some filters.',
    searchPlaceholder:'Search by role, organization, sector, country or keyword…',
    compare:'Compare', recentlyViewed:'Recently viewed', menu:'Menu', close:'Close', apply:'Apply / Open',
    disclaimer:'Always verify the vacancy, employer identity and eligibility on the original source.',
    open:'Open', closingSoon:'Closing Soon', deadlinePassed:'Deadline Passed', notAvailable:'Not Available', monitoring:'Monitoring',
    careersAvailable:'Careers Page Available', officialOnly:'Official Website Only', recruitmentPlatform:'Recruitment Through Platform',
    statusUnknown:'Status Unknown', trackTitle:'Application tracking', notes:'Notes', deadline:'Deadline', followUp:'Follow-up date',
    contact:'Contact person', cvVersion:'CV version', coverLetter:'Cover letter', applicationDate:'Application date', save:'Save',
    dashboard:'Dashboard', totalRecords:'Total records', datasets:'Categories', activeJobs:'Open / monitoring', tracked:'Tracked applications',
    favoritesCount:'Favorites', dataFreshness:'Data freshness', linkHealth:'Link health', refresh:'Refresh data',
    workingOffline:'Offline-ready', home:'Home', about:'About', records:'records', generatedSearch:'Generated live search',
    official:'Official', established:'Established', unverified:'Unverified', viewGrid:'Grid', viewTable:'Table',
    favoriteOnly:'Favorites only', hideClosed:'Hide unavailable', english:'English', arabic:'العربية',
    browseAll:'Browse all', startExploring:'Start exploring', africaDirectory:'Africa NGO directory', myStatus:'My status', noSuitableVacancy:'No suitable vacancy currently', notAvailableHelp:'Use Not Available after checking the careers page and finding no vacancy that suits you right now.'
  },
  ar: {
    theme:'المظهر', language:'English', search:'بحث', explore:'البحث في الكل', clear:'مسح', filters:'الفلاتر',
    all:'الكل', country:'الدولة / السوق', region:'المنطقة', type:'النوع', fit:'مدى الملاءمة', status:'الحالة', dataset:'القسم',
    sort:'الترتيب', bestMatch:'الأكثر ملاءمة', newest:'الأحدث', name:'الاسم', favorites:'المفضلة', saved:'محفوظ',
    results:'نتيجة', openSource:'فتح المصدر', track:'متابعة', details:'التفاصيل', lastChecked:'آخر تحقق',
    source:'المصدر', trust:'موثوقية المصدر', linkStatus:'حالة الرابط', profileMatch:'مدى الملاءمة المهنية',
    availability:'التوفر', needsVerification:'يحتاج تحققًا', working:'يعمل', unknown:'غير معروف',
    exportCsv:'تصدير CSV', backup:'نسخة احتياطية', import:'استيراد', previous:'السابق', next:'التالي',
    noResults:'لا توجد نتائج مطابقة. جرّب كلمة أوسع أو امسح بعض الفلاتر.',
    searchPlaceholder:'ابحث بالمسمى أو الجهة أو القطاع أو الدولة أو كلمة مفتاحية…',
    compare:'مقارنة', recentlyViewed:'شوهد مؤخرًا', menu:'القائمة', close:'إغلاق', apply:'فتح / تقديم',
    disclaimer:'تحقق دائمًا من الوظيفة وهوية جهة العمل وشروط الأهلية من المصدر الأصلي.',
    open:'متاح', closingSoon:'يغلق قريبًا', deadlinePassed:'انتهى الموعد', notAvailable:'غير متاح', monitoring:'متابعة',
    careersAvailable:'صفحة وظائف متاحة', officialOnly:'الموقع الرسمي فقط', recruitmentPlatform:'التوظيف عبر منصة',
    statusUnknown:'الحالة غير معروفة', trackTitle:'متابعة التقديم', notes:'ملاحظات', deadline:'الموعد النهائي', followUp:'موعد المتابعة',
    contact:'جهة الاتصال', cvVersion:'نسخة السيرة الذاتية', coverLetter:'خطاب التقديم', applicationDate:'تاريخ التقديم', save:'حفظ',
    dashboard:'لوحة المؤشرات', totalRecords:'إجمالي السجلات', datasets:'الأقسام', activeJobs:'متاح / قيد المتابعة', tracked:'طلبات تتم متابعتها',
    favoritesCount:'المفضلة', dataFreshness:'حداثة البيانات', linkHealth:'سلامة الروابط', refresh:'تحديث البيانات',
    workingOffline:'جاهز دون اتصال', home:'الرئيسية', about:'عن المشروع', records:'سجل', generatedSearch:'بحث حي مولّد',
    official:'رسمي', established:'معروف', unverified:'غير متحقق', viewGrid:'بطاقات', viewTable:'جدول',
    favoriteOnly:'المفضلة فقط', hideClosed:'إخفاء غير المتاح', english:'English', arabic:'العربية',
    browseAll:'تصفح الكل', startExploring:'ابدأ الاستكشاف', africaDirectory:'دليل منظمات أفريقيا', myStatus:'حالتي', noSuitableVacancy:'لا توجد وظيفة مناسبة حاليًا', notAvailableHelp:'اختر Not Available بعد فتح صفحة التوظيف والتأكد من عدم وجود وظيفة مناسبة لك حاليًا.'
  }
};

export function getLanguage(){return localStorage.getItem('career-language') || 'en'}
export function t(key, lang=getLanguage()){return translations[lang]?.[key] ?? translations.en[key] ?? key}
export function setLanguage(lang){
  const next = lang === 'ar' ? 'ar' : 'en';
  localStorage.setItem('career-language', next);
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.body?.classList.toggle('rtl', next === 'ar');
  applyTranslations();
  window.dispatchEvent(new CustomEvent('career-language-change',{detail:{language:next}}));
}
export function applyTranslations(root=document){
  const lang=getLanguage();
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  root.querySelectorAll?.('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    if(el.matches('input,textarea') && el.dataset.i18nAttr==='placeholder') el.placeholder=t(key,lang);
    else el.textContent=t(key,lang);
  });
}
