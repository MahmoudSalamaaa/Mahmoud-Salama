# Mahmoud Salama Career & Opportunity Hub — UI/UX Edition

نسخة كاملة ومبسطة من مشروع البحث عن الوظائف والجهات ومنظمات أفريقيا والمشروعات. جميع الملفات موجودة داخل مجلد `organizations`، ولا يحتاج المشروع إلى خدمة ذكاء اصطناعي أو مفتاح API.

## أهم ما تتضمنه النسخة

- صفحة رئيسية حديثة وواضحة بأربع وجهات رئيسية.
- صفحة **Explore** للبحث التقليدي في جميع قواعد البيانات باستخدام كلمات مفتاحية وفلاتر واضحة.
- دليل مستقل يضم **148 منظمة ومؤسسة تعمل في أفريقيا**.
- قواعد وظائف مصر والخليج والعمل عن بُعد والوظائف الإقليمية.
- أدلة جهات التكنولوجيا، الصحة الرقمية، وكالات التوظيف، البوابات الحكومية، الشركات الخاصة والمشروعات.
- Application Tracker للمفضلة وحالة التقديم والمواعيد والملاحظات.
- Dashboard، فحص الروابط، إدارة البيانات، تصدير CSV ونسخ احتياطي JSON.
- دعم العربية وRTL والوضع الفاتح والداكن.
- تصميم Responsive وPWA وOffline shell.

## التغييرات في التصميم

- نظام ألوان احترافي: Navy + Blue + Teal مع ألوان حالة واضحة.
- الوضع الفاتح هو الافتراضي، مع دعم الوضع الداكن.
- تباين واضح للنصوص وحالات Focus مرئية للاستخدام بلوحة المفاتيح.
- ارتفاع 44px على الأقل للأزرار والحقول لتحسين سهولة اللمس.
- شبكة مسافات موحدة وبطاقات أبسط وتسلسل بصري أوضح.
- تنقل رئيسي مختصر، والأقسام الثانوية داخل قائمة **More**.
- تحسين كامل للهواتف والأجهزة اللوحية.

## تشغيل المشروع محليًا

### Windows

شغّل:

```text
start-local.bat
```

ثم افتح:

```text
http://localhost:8080/index.html
```

### macOS / Linux

```bash
./start-local.sh
```

## النشر على Vercel

اجعل **Root Directory** هو:

```text
organizations
```

لا توجد متغيرات بيئة مطلوبة. فاحص الروابط فقط يستخدم Serverless Function الموجودة في `api/check-link.js`.

## بنية البيانات

ترتيب تحميل البيانات:

1. ملفات CSV الموجودة محليًا داخل المشروع.
2. نسخة GitHub الثابتة للمشروع الأصلي.
3. بيانات Seed المضمنة في `data/seed.json`.
4. سجلات Monitoring المولدة بوضوح للحفاظ على تغطية المشروع دون الادعاء بأن كل نتيجة وظيفة مفتوحة.

صيغة CSV الأساسية:

```text
id,title,subtitle,type,region,country,location,fit,status,posted,checked,notes,source,url
```

## التحقق

```bash
npm run validate
```

يتحقق من الملفات الأساسية، إزالة مكونات البحث الذكي، سلامة صفحات HTML، بيانات Offline وعدد عناصر مصفوفة البحث.

## الخصوصية

المفضلة، بيانات المتابعة والإعدادات تحفظ داخل `localStorage` في المتصفح. لا يتم إرسال عمليات البحث أو بيانات المستخدم إلى خدمة خارجية.

## Personal status: Not Available

A new personal tracking status is available on every result card and in the details modal:

- **Not Available** means you opened the organization or employer careers page and did not find a vacancy suitable for you at that time.
- It is saved only in your browser as part of your personal tracker.
- It does **not** mean the organization has stopped hiring or that its careers page is unavailable.
- The tracker records the date when you marked the item as Not Available.

