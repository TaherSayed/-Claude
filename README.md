# 💈 Barber AI Stylist

تطبيق iPad / Android لمحلات الحلاقة: الزبون يبص للكاميرا، التطبيق يحلل شكل الوش ونوع الشعر، ويقترح **3 قصات** مناسبة مع طريقة طلبها من الحلاق وأرقام الماكينة والعناية.

An iPad / Android app for barbershops: the customer looks at the camera, the app analyses face shape and hair type and recommends **3 haircuts** with how to ask the barber, clipper guards and maintenance.

Built with **Expo (React Native) + TypeScript**. Works with any of these AI providers (bring your own API key):

| Provider | Default model | Where to get a key |
|---|---|---|
| Anthropic Claude (default) | `claude-opus-5` | https://platform.claude.com |
| OpenAI | `gpt-4o` | https://platform.openai.com/api-keys |
| Google Gemini | `gemini-2.5-flash` | https://aistudio.google.com/apikey |

UI languages: **العربية (مصري)**, Deutsch, English.

---

## 🚀 تشغيل سريع / Quick start

```bash
npm install
npx expo start
```

- **على الجهاز مباشرة (أسرع طريقة للتجربة):** نزّل تطبيق **Expo Go** من App Store / Play Store وامسح الـ QR.
- **iPad:** `npm run ios` (يحتاج Mac + Xcode) أو Expo Go.
- **Android:** `npm run android` (يحتاج Android Studio أو جهاز متصل بـ USB) أو Expo Go.

بعد ما التطبيق يفتح: **الإعدادات → اختار المزوّد → حط مفتاح API → حفظ**. بعدها **ابدأ التحليل**.

## 📦 بناء نسخة نهائية للمحل / Production build

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # ملف APK يتسطب مباشرة على أي تابلت أندرويد
eas build --platform ios                          # يحتاج حساب Apple Developer
```

## 🌐 النشر على VPS (نسخة الويب) / Deploy on a VPS

نسخة الويب بتشتغل على الآيباد والأندرويد من المتصفح مباشرة بدون متجر. **الكاميرا مش هتفتح إلا على https://**.

```bash
# على السيرفر (يحتاج Docker):
curl -fsSL https://raw.githubusercontent.com/TaherSayed/-Claude/main/deploy/deploy.sh | bash
```

ده بيعمل clone في `/opt/barber-ai-stylist`، يبني الصورة، ويشغّل الحاوية على البورت `8088` (غيّره في `docker-compose.yml` لو متعارض مع TimeOs).

بعدها فعّل HTTPS بدومين فرعي:
- **Caddy** (أسهل): `deploy/Caddyfile.example`
- **nginx + certbot** لو السيرفر عليه nginx أصلاً: `deploy/nginx-proxy.example.conf`

### نشر تلقائي مع كل push
الـ workflow في `.github/workflows/deploy.yml` بيعمل SSH على السيرفر ويشغّل `deploy/deploy.sh`. ضيف في GitHub → Settings → Secrets:

| Secret | القيمة |
|---|---|
| `VPS_HOST` | IP أو دومين السيرفر |
| `VPS_USER` | يوزر SSH (لازم يكون في مجموعة docker) |
| `VPS_SSH_KEY` | المفتاح الخاص (private key) |
| `VPS_PORT` | اختياري، الافتراضي 22 |

## 🧠 كيف يشتغل / How it works

1. `expo-camera` يصوّر الزبون (الكاميرا الأمامية افتراضيًا، مع دايرة إرشاد).
2. `expo-image-manipulator` يصغّر الصورة لـ 1024px JPEG لتقليل الحجم والتكلفة.
3. الصورة تتبعت للمزوّد المختار (`src/providers/`) مع system prompt لخبير حلاقة و **JSON schema** ثابت.
4. الرد يتحوّل لكروت: شكل الوش، نوع الشعر، 3 قصات مرتبة بنسبة تطابق، قصات تتجنبها، ونصيحة.

```
src/
  providers/
    anthropic.ts   # Official @anthropic-ai/sdk, structured output, server-side refusal fallback
    openai.ts      # Chat Completions + response_format json_schema
    gemini.ts      # generateContent + responseSchema
    prompt.ts      # Shared system prompt + JSON schema
    parse.ts       # Validates model output
  screens/         # Home, Camera, Result, Settings
  i18n.ts          # ar / de / en strings
  storage.ts       # API key + settings in expo-secure-store (device only)
```

## 🔐 ملاحظات أمان / Security notes

- مفتاح الـ API بيتحفظ **على الجهاز بس** في `expo-secure-store` (Keychain / Keystore). مناسب لتابلت المحل.
- لو هتنشر التطبيق على المتاجر لعملاء كثيرين، الأفضل تعمل backend صغير (مثلاً Cloudflare Worker) يمسك المفتاح والتطبيق يكلمه — عشان المفتاح ما يتوزعش مع التطبيق.
- الصور **لا تُحفظ** في التطبيق ولا تُرفع لأي مكان غير مزوّد الـ AI لحظة التحليل.

## 🛠️ تعديلات شائعة

- تغيير الموديل: من شاشة الإعدادات (أي موديل يدعم الصور).
- تعديل أسلوب النصايح أو عدد القصات: `src/providers/prompt.ts`.
- إضافة لغة: `src/i18n.ts`.
