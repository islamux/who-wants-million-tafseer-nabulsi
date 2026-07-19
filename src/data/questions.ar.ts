import type { Question } from '../types/game'

export const chapterQuestionsAr: Record<number, Question[]> = {
  1: [
    {
      text: 'في مشروع `tafsir-nabulsi`، لماذا يُطلق على `useAppState` اسم "god hook" (الخطّاف الشامل)، وما هي المقايضة (trade-off) مقارنة باستخدام Redux أو Zustand أو Context؟',
      options: [
        { text: 'لأنه يُنشئ 6 خطّافات (`useTheme`، `useBookmarks`، `useProgress`، `useTafsir`، `useSearch`، `useDataSync`) في كائن مسطّح واحد، ويوفّر صفر تعقيد وسفر على حساب حفر ثقوب (prop drilling) ضخمة.', correct: true },
        { text: 'لأنه يستخدم Redux Toolkit تحت الغطاء ويكشف متجراً شاملاً.', correct: false },
        { text: 'لأنه ينشئ Context منفصلاً لكل حقل حالة في التطبيق.', correct: false },
        { text: 'لأنه class component يرث من React.Component ويحتوي على كل الحالة.', correct: false },
      ],
    },
    {
      text: 'لماذا `tsconfig.json` يضبط `noEmit: true` بينما Vite هو الذي يتولّى التجميع؟',
      options: [
        { text: 'لأن TypeScript يُستخدم لفحص الأنواع فقط دون توليد ملفات .js، وVite/esbuild عبر `@vitejs/plugin-react` يتولّى التحويل والتجميع النهائي.', correct: true },
        { text: 'لأن `noEmit` خطأ إملائي والصحيح `emit: true`.', correct: false },
        { text: 'لأن Vite يتطلب تعطيل توليد خرائط المصدر (source maps).', correct: false },
        { text: 'لأن `noEmit` يُعطّل مُجمّع TypeScript بالكامل ولا يفحص الأنواع.', correct: false },
      ],
    },
    {
      text: 'كيف يتعامل التجميع التلقائي (automatic batching) في React 19 مع استدعاءات `setSelectedSurah` و`setActiveTab` المتتابعة داخل معالج الحدث الواحد في `useAppState`؟',
      options: [
        { text: 'يتم تجميع تحديثات الحالة المتعددة في عرض (render) واحد، حتى عبر خطّافات مختلفة، وهذا يحسّن الأداء مقارنة بـ React 18 الذي كان يجمّع داخل أحداث React فقط.', correct: true },
        { text: 'كل `setState` يُسبّب عرضاً متزامناً وفورياً منفصلاً.', correct: false },
        { text: 'التجميع التلقائي يعمل في React Native فقط ولا يعمل في React DOM.', correct: false },
        { text: 'أُلغي التجميع التلقائي في React 19 وأصبح يجب استدعاء `flushSync`.', correct: false },
      ],
    },
    {
      text: 'ما الفائدة من استخدام discriminated union في نوع `GameAction` في `useGame.ts` بدلاً من واجهة عادية؟',
      options: [
        { text: 'كل نوع فرعي يحمل `type` حرفي فريد يُضيّق (narrow) الاتحاد داخل `switch`، فيفرض TypeScript معالجة كل الحالات وأن `payload` يطابق `type` الخاص به.', correct: true },
        { text: 'الاتحاد المميّز أسرع وقت التشغيل لأن V8 يُحسّنه.', correct: false },
        { text: 'يسمح بإرسال الإجراءات عبر الشبكة كـ JSON دون تسلسل.', correct: false },
        { text: 'يمنع الكود الخارجي من تعديل الحالة مباشرة.', correct: false },
      ],
    },
    {
      text: 'لماذا `useTheme()` في `ThemeContext.tsx` يرمي (throws) خطأً إذا استُخدم خارج `ThemeProvider`، بدلاً من إرجاع قيمة افتراضية؟',
      options: [
        { text: 'للفشل بصوت عالٍ أثناء التطوير — استخدام قيمة افتراضية صامتة سيُخفي الأخطاء عندما ينسى المطوّر تضمين الـ Provider في شجرة المكوّنات.', correct: true },
        { text: 'لأن رمي الخطأ أسرع من التحقق من السياق وإرجاع null.', correct: false },
        { text: 'لأن `useContext` يرمي دائماً عند غياب الـ Provider في React 19.', correct: false },
        { text: 'لأن هذا يمكّن استخدام الخطّاف في العرض من الخادم (SSR).', correct: false },
      ],
    },
  ],
  2: [
    {
      text: 'لماذا يستخدم `vite.config.ts` Vite 8 مع Rolldown بدلاً من Rollup، وما الفائدة العملية في HMR؟',
      options: [
        { text: 'Rolldown بديل لـ Rollup مبني بـ Rust يوفّر بدايات باردة وتحديثات HMR أسرع — Vite 8 يشحنه كـ bundler افتراضي.', correct: true },
        { text: 'Rolldown اسم قديم لـ Rollup محفوظ للتوافق.', correct: false },
        { text: 'Rolldown مطلوب لعمل PWA ولا يدعم Rollup ذلك.', correct: false },
        { text: 'Rolldown يعمل في وضع الإنتاج فقط ولا يعمل في التطوير.', correct: false },
      ],
    },
    {
      text: 'كيف يقسم `manualChunks(id)` في `vite.config.ts` ملف التفسير (18 ميغابايت) إلى chunk مستقل، وماذا يحقق `import(\'./tafsir\')` الديناميكي في `tafsir-loader.ts`؟',
      options: [
        { text: 'قاعدة `manualChunks` تُوجّه أي موديول يطابق `/src/data/tafsir` إلى chunk اسمه `tafsir`، والاستيراد الديناميكي يُفعّل code-splitting في Vite ويُحمَّل كسولاً فقط عند فتح أول سورة.', correct: true },
        { text: 'manualChunks يضيف البيانات إلى الحزمة الرئيسية لتسريع التحميل الأولي.', correct: false },
        { text: 'Workbox يحظر الاستيرادات الديناميكية ويجب إدراجها داخل السطر.', correct: false },
        { text: 'manualChunks للتطوير فقط ويُتجاهل في الإنتاج.', correct: false },
      ],
    },
    {
      text: 'لماذا يستخدم المشروع Tailwind CSS v4 مع كتلة `@theme {}` المعتمدة على CSS في `src/index.css`، بدلاً من ملف `tailwind.config.js`؟',
      options: [
        { text: 'Tailwind v4 يُلغي ملف إعدادات JS ويستبدله بـ design tokens معرّفة في CSS — كتلة `@theme` تعرّف خصائص مخصصة (`--color-gilded-gold` وغيرها) تتحول إلى utility classes مثل `bg-brand-dark-bg`.', correct: true },
        { text: 'إعداد CSS-first مطلوب لدعم RTL.', correct: false },
        { text: '@theme يُمكّن tree-shaking لـ utility classes غير المستخدمة.', correct: false },
        { text: 'إنه حل بديل لتعارض مع Vite.', correct: false },
      ],
    },
    {
      text: 'ماذا يفعل `registerType: \'autoUpdate\'` في `vite-plugin-pwa`، ولماذا قد يكون مصدر قلق للمستخدمين الذين لديهم Service Worker قديم بعد النشر؟',
      options: [
        { text: 'يُفعّل Service Worker الجديد تلقائياً بمجرد تنزيله، لكن التفعيل قد يحدث وسط الجلسة ويُسبّب كسر واجهة المستخدم إذا أسقط الـ SW الجديد أصولاً مخزّنة كان الإصدار القديم يعتمد عليها.', correct: true },
        { text: 'يمنع Service Worker من التحديث.', correct: false },
        { text: 'يُعيد تحميل الصفحة تلقائياً عند كل تحديث.', correct: false },
        { text: 'autoUpdate هو الوضع الوحيد الذي يدعمه Workbox.', correct: false },
      ],
    },
    {
      text: 'لماذا يستخدم سكربت البناء `esbuild server.ts --bundle --platform=node --format=cjs --packages=external` لخادم Express، بدلاً من تشغيله مباشرة عبر `tsx` في الإنتاج؟',
      options: [
        { text: 'esbuild يحزّم الخادم في ملف CJS واحد مع إبقاء الاعتماديات خارجية، فيمكن تشغيل `node dist/server.cjs` على أي بيئة Node (Vercel، Docker، خادم عادي) دون الحاجة لـ tsx وقت التشغيل.', correct: true },
        { text: 'esbuild أسرع من tsx في التطوير أيضاً.', correct: false },
        { text: '`--packages=external` يُدخل كل الاعتماديات في الحزمة لتجنّب حلّ Node modules.', correct: false },
        { text: 'esbuild يُولّد مخرجات ESM افتراضياً.', correct: false },
      ],
    },
  ],
  3: [
    {
      text: 'لماذا `ErrorBoundary` هو class component الوحيد في كامل قاعدة الكود؟',
      options: [
        { text: 'لأن React 19 لا يزال يتطلب class components لـ error boundaries — لا يوجد خطّاف مكافئ لـ `getDerivedStateFromError`/`componentDidCatch` حتى الآن.', correct: true },
        { text: 'لأن class components أسرع من function components في حدود الخطأ.', correct: false },
        { text: 'لأن بقية المكوّنات تم تحويلها إلى functions لتحسين الأداء.', correct: false },
        { text: 'إنه متطلب قديم من مُجمّع TypeScript.', correct: false },
      ],
    },
    {
      text: 'كيف ينسّق `React.lazy` + `Suspense` + `AnimatePresence mode="wait"` تحميل المكوّنات الأربعة للتبويبات (`OverviewTab`، `VersesTab`، `ChatTab`، `StatsTab`) في `MainContent.tsx`؟',
      options: [
        { text: '`lazy()` يؤخّر موديول كل تبويب إلى أول عرض له، `Suspense` يعرض fallback أثناء الاستيراد الديناميكي، و`AnimatePresence mode="wait"` ينتظر انتهاء التبويب الخارج من حركة الخروج قبل تركيب التبويب الجديد.', correct: true },
        { text: 'Suspense يشغّل التحميل الكسول بالتوازي مع التبويب الحالي.', correct: false },
        { text: 'AnimatePresence mode="wait" يمنع التبويب الجديد من الحركة عند الدخول.', correct: false },
        { text: 'كل التبويبات الأربعة تُحمَّل فوراً عند أول عرض.', correct: false },
      ],
    },
    {
      text: 'لماذا `SurahBanner` و`Footer` ملفوفان بـ `memo`، بينما التبويبات الأربعة غير ملفوفة؟',
      options: [
        { text: 'SurahBanner/Footer يستقبلان props بدائية ثابتة ويُعرضان عند كل تحديث أبوي، `memo` يتخطّاهما عند عدم تغيّر الـ props؛ التبويبات تستقبل callbacks كثيرة تتغير هويتها، فـ memo لن يصمد أبداً.', correct: true },
        { text: 'memo واجهة قديمة في React 19.', correct: false },
        { text: 'التبويبات لا يمكن لفّها بـ memo لأنها تستخدم lazy.', correct: false },
        { text: 'memo يضيف تكلفة وقت تشغيل ولا يستحق إلا في المكوّنات الضخمة.', correct: false },
      ],
    },
    {
      text: 'المشروع بلا router (لا React Router ولا TanStack Router) — يستخدم `activeTab: \'overview\' | \'verses\' | \'chat\' | \'stats\'` كـ useState عادي. ما المقايضة؟',
      options: [
        { text: 'صفر اعتماديات ولا حالة URL — لكن لا توجد روابط قابلة للمشاركة، ولا أزرار browser back/forward، ولا deep links لعرض جزء محدد.', correct: true },
        { text: 'useState أسرع من أي router.', correct: false },
        { text: 'router سيُعطّل حركات AnimatePresence.', correct: false },
        { text: 'المطوّر نسي إضافة router.', correct: false },
      ],
    },
    {
      text: '`App.tsx` مخرّب hub (76 سطراً) يحطّم `useAppState()` ويمرّر ~25 حقلاً إلى `Sidebar` و`MainContent`. ما القرار المعماري الذي يعكسه هذا؟',
      options: [
        { text: 'الكاتب اختار تدفق بيانات صريح على حساب تدفق ضمني — أسهل في تتبّع مصدر كل prop، لكن `App.tsx` يصبح مُلزماً بمعرفة كل حقل من حقول `useAppState`.', correct: true },
        { text: 'prop drilling أسرع من Context لأنه يتجنّب re-renders.', correct: false },
        { text: 'Context لا يعمل في React 19.', correct: false },
        { text: 'App.tsx يُولَّد تلقائياً من Vite.', correct: false },
      ],
    },
    {
      text: 'لماذا `Sidebar.tsx` (261 سطراً) يحصل على تنقل ثلاثي الألواح (قائمة السور، قائمة الأجزاء، فلتر النوع) مع `motion.div layoutId` لتسطير التبويب المتحرك، بدلاً من تقسيمه إلى صفحات routes منفصلة؟',
      options: [
        { text: 'المشروع صفحة واحدة بالتصميم — إبقاء التنقل في مكوّن واحد يطابق معمارية بلا router، ويستخدم `layoutId` لانتقال سلس للتسطير المتحرك بين تبويبي السور والأجزاء.', correct: true },
        { text: 'التقسيم سيمنع استخدام motion.', correct: false },
        { text: 'Sidebar لا يمكن تقسيمه بسبب تخطيط RTL.', correct: false },
        { text: 'حد الـ 261 سطر قيد يفرضه مُجمّع TypeScript.', correct: false },
      ],
    },
  ],
  4: [
    {
      text: '`useAppState` يُنشئ 6 خطّافات فرعية ويُرجع كائناً مسطحاً. قارن هذا بـ Redux Toolkit / Zustand / Context. ما المقايضة الأساسية؟',
      options: [
        { text: 'god-hook يعطي صفر indirection وصفر اعتماديات، لكنه يربط كل مكوّن ارتباطاً وثيقاً بشكل الحالة المركزي — إضافة/إعادة تسمية حقل يتطلب لمس قائمة props في `App.tsx` وكل مستهلك.', correct: true },
        { text: 'Redux أبطأ دائماً ولا يجب استخدامه.', correct: false },
        { text: 'useAppState يُسبّب re-renders كاملة عند أي تغيير ويُعطّل React reconciler.', correct: false },
        { text: 'نمط god-hook مُهمَل في React 19.', correct: false },
      ],
    },
    {
      text: 'لماذا `ThemeContext` هو React Context الوحيد في التطبيق، بينما بقية الحالة تعيش في `useAppState`؟',
      options: [
        { text: 'الـ theme يُقرأ من مكوّنات متداخلة بعمق (Sidebar، MainContent، headers) التي ستحتاج prop drilling بدون Context، وتغييراته نادرة فكلفة الـ re-render هامشية.', correct: true },
        { text: 'Context مطلوب لقراءة localStorage.', correct: false },
        { text: 'كل الحالات الأخرى ستُنقل إلى Context في المستقبل.', correct: false },
        { text: 'React 19 يفرض Context واحد على الأقل لكل تطبيق.', correct: false },
      ],
    },
    {
      text: '`useTafsir` يستخدم قطعتي حالة (`tafsirText: string | null` و`verseRangeValue: string`) وcallback اسمه `fetchTafsir`. هل يمكن استبداله بـ `useReducer`؟ ومتى يكون ذلك مناسباً؟',
      options: [
        { text: 'لقطعتين مستقلتين مع side effects غير متزامنة، `useState` كافٍ؛ `useReducer` يصبح أفضل حين تتضمن الانتقالات تحققاً متعدد الخطوات أو rollback.', correct: true },
        { text: 'useReducer أسرع دائماً ويجب تفضيله.', correct: false },
        { text: 'useTafsir لا يمكن تحويله لأنه يستخدم localStorage.', correct: false },
        { text: 'useReducer مطلوب من TypeScript strict mode.', correct: false },
      ],
    },
    {
      text: 'في `useBookmarks.ts`، يُبنى id الإشارة المرجعية كـ `${surahId}-${verseIndex}` (أو `${surahId}` لإشارات على مستوى السورة). ماذا يعني هذا عن ضمانات التفرّد؟',
      options: [
        { text: 'الـ id سلسلة مشتقّة وليس UUID — مستقر وقابل للقراءة البشرية، لكنه يعتمد على اصطلاح أن verse indices فريدة داخل السورة، وليس على مستوى عام.', correct: true },
        { text: 'الـ id UUID v4 من `crypto.randomUUID`.', correct: false },
        { text: 'سورتان مختلفتان لا يمكنهما أبداً مشاركة نفس الـ id.', correct: false },
        { text: 'الـ id مُرمّز بـ base64 للضغط.', correct: false },
      ],
    },
    {
      text: 'في `useTafsir.ts`، تستدعي `fetchTafsir` `setTafsirText(null)` قبل `await loadTafsirData()`. ما الذي يحمي منه هذا؟',
      options: [
        { text: 'حالة قديمة (stale state) — إذا بدّل المستخدم السور بسرعة، فإن `loadTafsirData` الأقدم الطائر سيحل ويُطمس نص السورة الأحدث. ضبط null أولاً يُجبر الواجهة على إظهار حالة التحميل.', correct: true },
        { text: 'يحرر الذاكرة قبل الجلب الجديد.', correct: false },
        { text: 'يمنع تحميل التفسير مرتين.', correct: false },
        { text: 'يُعيد ضبط مُحدِّد نطاق الآيات (verse range selector).', correct: false },
      ],
    },
  ],
  5: [
    {
      text: 'لماذا يحتفظ `tafsir-loader.ts` بـ `dataPromise` على مستوى الوحدة ويستدعي `import(\'./tafsir\')` مرة واحدة فقط لكل جلسة؟ ماذا يحدث عند الخطأ؟',
      options: [
        { text: 'النمط يضمن استيراداً ديناميكياً واحداً بالضبط لكل جلسة — نفس الـ promise المحسوم لكل المستهلكين. عند الرفض، يُعاد ضبط `dataPromise` إلى null ليعي الاستدعاء التالي المحاولة بنظافة.', correct: true },
        { text: 'dataPromise يُخزّن النص المُحَلّل في الذاكرة عبر إعادات التحميل.', correct: false },
        { text: 'الاستيرادات المتعددة ستسبب stack overflow.', correct: false },
        { text: 'النمط يُمكّن الوصول دون اتصال عبر Service Worker.', correct: false },
      ],
    },
    {
      text: '`localStorageBackend.set()` يُطلق جميع callbacks المسجّلة في `onChange` بعد الكتابة. ما النمط الذي يُنفّذه هذا، وما المقايضة مقارنة بـ useEffect يراقب storage event؟',
      options: [
        { text: 'pub/sub داخل العملية — سريع، بلا تكلفة storage event، لكن callbacks تُطلَق فقط لكتابات داخل التطبيق (لا لكتابات من تبويبات أخرى).', correct: true },
        { text: 'يستخدم storage event المدمج في المتصفح.', correct: false },
        { text: 'يتطلب تسجيل Service Worker.', correct: false },
        { text: 'أبطأ من useEffect بسبب JSON.stringify.', correct: false },
      ],
    },
    {
      text: '`syncBackend` يستخدم debounce مدته 1.5 ثانية وإعادة محاولات بـ exponential backoff (1s، 2s، 4s) حتى 3 مرات قبل الاستسلام. ما الذي يحمي منه كل جزء؟',
      options: [
        { text: 'debounce يدمج التعديلات السريعة (مثل سحب slider) في PUT واحد، backoff يتعامل مع انقطاعات الشبكة العابرة، وحد الـ 3 محاولات يمنع تعليق الواجهة على اتصال ميّت.', correct: true },
        { text: 'الـ 1.5 ثانية هي timeout قبل الفشل.', correct: false },
        { text: 'exponential backoff يعني الانتظار أطول عند كل محاولة ناجحة.', correct: false },
        { text: 'حد الـ 3 محاولات يُفعّل window.confirm.', correct: false },
      ],
    },
    {
      text: 'عندما تفشل كل المحاولات، يُكتب `localStorage.setItem(\'dhilal_sync_pending\', \'true\')`. ماذا يفعل `useDataSync` بهذه العلامة في الواجهة؟',
      options: [
        { text: 'يشترك في نفس المفتاح عبر `localStorageBackend.onChange` ويُظهر مؤشر "مزامنة معلّقة" (مثل نقطة) كي يعرف المستخدم أن تغييراته لم تصل إلى الخادم بعد.', correct: true },
        { text: 'يُطلق إعادة مزامنة فورية بدون debounce.', correct: false },
        { text: 'يمسح localStorage لتوفير المساحة.', correct: false },
        { text: 'يعرض modal يطلب من المستخدم إعادة الاتصال.', correct: false },
      ],
    },
    {
      text: 'device id يُولَّد عبر `crypto.randomUUID()` ويُخزَّن في `dhilal_device_id` عند أول استدعاء، ويُرسَل إلى الـ API كـ `X-Device-Id`. ما الأثر الأمني؟',
      options: [
        { text: 'التطبيق يستخدم "تعريف الجهاز" بدلاً من المصادقة — أي شخص يحمل device id (أو نسخة مسربة من localStorage) يمكنه قراءة/كتابة بيانات هذا الجهاز. لا كلمة مرور، لا JWT، لا انتهاء صلاحية.', correct: true },
        { text: 'device id مُشفّر بكلمة مرور المستخدم.', correct: false },
        { text: '`crypto.randomUUID` آمن تشفيرياً لذا لا توجد أي مخاطرة.', correct: false },
        { text: 'الـ id يُرسَل فقط عبر HTTPS فلا يمكن تسريبه.', correct: false },
      ],
    },
  ],
}

export const chapterListAr = [
  { id: 1, title: 'أساسيات React و TypeScript' },
  { id: 2, title: 'أدوات البناء والنشر' },
  { id: 3, title: 'البنية المعمارية' },
  { id: 4, title: 'إدارة الحالة والخطّافات المخصصة' },
  { id: 5, title: 'المكافآت الإضافية' },
]

export const chapterNamesAr: Record<number, string> = {
  1: 'الأول',
  2: 'الثاني',
  3: 'الثالث',
  4: 'الرابع',
  5: 'الخامس',
}
