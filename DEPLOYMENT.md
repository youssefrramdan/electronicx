# 🚀 دليل رفع Fresh Cart على Vercel

## خطوات النشر:

### 1. إعداد المشروع:

```bash
# تنظيف المشروع
npm run build

# التأكد من عدم وجود أخطاء
npm test -- --watchAll=false
```

### 2. رفع على GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3. نشر على Vercel:

#### الطريقة الأولى - Vercel Dashboard:

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بـ GitHub account
3. اضغط "New Project"
4. اختر المشروع من GitHub
5. اضغط "Deploy"

#### الطريقة الثانية - Vercel CLI:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel --prod
```

### 4. إعداد Environment Variables في Vercel:

في Vercel Dashboard → Project → Settings → Environment Variables:

```
Variable: REACT_APP_API_BASE_URL
Value: https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1
Environment: Production

Variable: GENERATE_SOURCEMAP
Value: false
Environment: Production

Variable: CI
Value: false
Environment: Production
```

### 5. تحديث إعدادات الباك إند:

بعد نشر المشروع، ستحصل على رابط مثل: `https://fresh-cart-xyz.vercel.app`

يجب تحديث:

#### في الباك إند (Heroku):

1. **CORS Settings** - إضافة domain الجديد:

```javascript
origin: [
  "http://localhost:3000",
  "https://fresh-cart-xyz.vercel.app", // رابط Vercel الجديد
];
```

2. **Stripe Success URL** - تحديث في environment variables:

```
CLIENT_URL=https://fresh-cart-xyz.vercel.app
```

#### في Stripe Dashboard:

1. Webhooks → تحديث URLs
2. Success/Cancel URLs في checkout settings

### 6. اختبار النشر:

✅ تسجيل دخول/تسجيل جديد
✅ عرض المنتجات
✅ إضافة للعربة
✅ عملية الدفع
✅ عرض الطلبات

### 7. Custom Domain (اختياري):

في Vercel Dashboard → Project → Settings → Domains:

- أضف domain مخصص
- اتبع إرشادات DNS

## ملاحظات مهمة:

🔒 **أمان**: كل API keys في environment variables
🌐 **CORS**: تأكد من إضافة Vercel domain للباك إند
💳 **Stripe**: تحديث webhook URLs وsuccess pages
📱 **Mobile**: الموقع responsive ويعمل على الجوال

## troubleshooting:

### مشكلة API requests:

- تأكد من `REACT_APP_API_BASE_URL`
- فحص CORS في الباك إند

### مشكلة البناء:

- فحص console errors
- تأكد من `CI=false` في environment variables

### مشكلة الدفع:

- تحديث Stripe success/cancel URLs
- تحديث webhook endpoints
