# المقابلة التقنية — Salamm (Khatir)

> **المرشح:** مقدم الطلب  
> **المُقابِل:** Senior Android Engineer  
> **المشروع:** Salamm (Khatir) — قارئ محتوى روحي إسلامي  
> **المنصة:** Android، Kotlin، Jetpack Compose  
> **عدد الأسئلة:** 25 سؤالاً (5 جولات)  
> **الهدف:** اختبار الفهم الحقيقي للكود، وليس الحفظ أو الـ copy-paste

---

## تعليمات التقيم

- لكل سؤال **4 معايير تقييم**، كل معيار من 0-5
- لكل جولة **مجموع من 100** (إلا الجولة الثالثة 80)
- **علامات حمراء**: إذا لم تعرف هذه النقاط، فأنت لا تفهم الكود فعلاً

---

## الجولة 1: أساسيات Kotlin & Android

### س1: StateFlow vs LiveData

**المرجع:** أي ViewModel في المشروع (مثلاً `ReaderViewModel.kt:18-19`)

```kotlin
private val _uiState = MutableStateFlow(ReaderUiState())
val uiState: StateFlow<ReaderUiState> = _uiState
```

**السؤال:** لماذا اخترت `StateFlow` بدلاً من `LiveData` في هذا المشروع؟ اذكر 3 فروقات جوهرية بينهما، ومتى قد تختار LiveData بدلاً منه؟

**الإجابة النموذجية:**

| الفرق | StateFlow | LiveData |
|-------|-----------|----------|
| المصدر | Kotlin Coroutines (kotlinx.coroutines.flow) | Android Architecture Components |
| القيمة الابتدائية | إجبارية (must have initial value) | اختيارية |
| الـ Lifecycle awareness | ليس lifecycle-aware بشكل تلقائي في Kotlin — يحتاج `.collectAsState()` في Compose | lifecycle-aware تلقائياً |
| الـ Platform dependency | Kotlin pure (يعمل على أي Kotlin platform) | Android-only (يعتمد على LifecycleOwner) |
| الـ Operators | كامل operators الـ Flow (map, filter, combine, flatMapLatest...) | محدودة جداً (map فقط مع Transformations) |
| الـ Null safety | يدعمه بالكامل | لا يدعمه (LiveData<T> يقبل null بدون تحذير) |

**لماذا StateFlow هنا؟**
1. المشروع 100% Compose — `collectAsState()` يربط StateFlow بالـ lifecycle تلقائياً
2. Kotlin-first philosophy: لا نريد اعتماداً على مكتبة Android-specific
3. القيمة الابتدائية الإجبارية تمنع الـ null state — لا يمكن أن يكون `uiState` null
4. سهولة الـ testing: `stateFlow.value` يمكن قراءته مباشرة في unit tests بدون mocking للـ LifecycleOwner

**متى نستخدم LiveData؟**
- في مشروع يستخدم XML layouts + DataBinding (LiveData يتكامل مع DataBinding مباشرة)
- في مشروع قديم لا يستخدم Compose
- عندما تحتاج Auto-disposal lifecycle بدون `collectAsState()` (لكن مع Compose هذا الفرق يختفي)

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف أن StateFlow من Kotlin Coroutines و LiveData من AndroidX | |
| يفهم lifecycle awareness وآلية عمل كل منهما | |
| يعرف أن `collectAsState()` في Compose هو الـ bridge | |
| يستطيع تبرير اختيار StateFlow في هذا المشروع تحديداً | |

**النقاط الحمراء:**
- ❌ "StateFlow أفضل من LiveData دائماً" — هذا خطأ. لكل منهما use case.
- ❌ عدم معرفة أن `collectAsState()` يحول StateFlow لـ State lifecycle-aware.

---

### س2: الـ Nullability في Kotlin — لماذا `footer: String?`؟

**المرجع:** `Page.kt:12`

```kotlin
val footer: String? = null
```

**السؤال:** الفرق بين `String` و `String?` في Kotlin. كيف تتعامل مع `footer` بدون if-null؟ مقارنة مع `Optional<String>` في Java — أيهما أفضل ولماذا؟

**الإجابة النموذجية:**

- `String` = non-nullable type. القيمة لا يمكن أبداً أن تكون null. يضمن الـ compiler ذلك في compile-time.
- `String?` = nullable type. القيمة يمكن أن تكون null. إجبارك على التعامل مع حالة الـ null.

**آليات التعامل مع nullable في Kotlin:**
- `?.` — safe call: `page.footer?.let { ... }` — ينفذ فقط إذا لم يكن null
- `?:` — Elvis operator: `page.footer ?: "بدون تذييل"`
- `!!` — force unwrap (danger zone — يرمي NullPointerException إن كان null)
- في المشروع: `page.footer?.let { parts.add(it) }` في `ReaderViewModel.kt:79` و `"footer" -> page.footer?.let { ... }` في `ReaderScreen.kt:357`

**المقارنة مع `Optional<String>` (Java 8+):**

| الجانب | Kotlin `String?` | Java `Optional<String>` |
|--------|------------------|-------------------------|
| Runtime overhead | لا يوجد — nullable type هو مجرد annotation في compile-time | يوجد — كائن Optional يلتف حول القيمة (heap allocation) |
| Interop | يُعرّف في type system على المستوى اللغوي | هو مجرد class عادي |
| Readability | أبسط — `?.` و `?:` و `!!` | `.map()`, `.orElse()`, `.orElseThrow()` — أسلوب functional |
| Performance | لا overhead | overhead (إنشاء كائن، method calls) |
| Serialization | kotlinx.serialization يتعامل معه تلقائياً | يحتاج custom serializer |
| Method parameter | `fun foo(s: String?)` طبيعي | `fun foo(s: Optional<String>)` anti-pattern في Java — لا تستخدم Optional في parameters |

**الخلاصة:** Kotlin nullable types أفضل في كل شيء هنا — أقل overhead، أكثر readability، تكامل تام مع serialization.

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم null safety في Kotlin والفرق بين nullable/non-nullable | |
| يعرف كل operators التعامل مع nullable (`?.`, `?:`, `!!`) | |
| يقارن بوعي بين Optional و nullable types | |
| يشرح لماذا Kotlin nullable أفضل في هذا السياق | |

**النقاط الحمراء:**
- ❌ استخدام `!!` في production code بدون فهم المخاطر
- ❌ عدم معرفة أن `String?` هو compile-time construct بلا overhead

---

### س3: Magic Numbers — الفرق بين الثوابت والأرقام السحرية

**المرجع:** `ReaderViewModel.kt:51-62`

```kotlin
fun increaseFontSize() {
    val current = _uiState.value.fontSize
    if (current < 37f) {
        _uiState.value = _uiState.value.copy(fontSize = current + 2f)
    }
}

fun decreaseFontSize() {
    val current = _uiState.value.fontSize
    if (current > 21f) {
        _uiState.value = _uiState.value.copy(fontSize = current - 2f)
    }
}
```

**السؤال:** ما هي الـ magic numbers في هذه الدوال؟ كيف تصلحها في Kotlin؟ واذكر مشكلة أخرى في هذه الدوال تتعلق بـ encapsulation.

**الإجابة النموذجية:**

**المشكلة الأولى — Magic Numbers:**
الأرقام `37f` و `21f` و `2f` هي magic numbers — أرقام بدون اسم ولا شرح. إذا احتجت تغيير الحد الأقصى للخط من 37 إلى 40، يجب أن تبحث عن كل `37f` في الكود.

**الحل:**

```kotlin
// Companion object أو top-level
private const val MIN_FONT_SIZE = 21f
private const val MAX_FONT_SIZE = 37f
private const val FONT_STEP = 2f
```

ثم:
```kotlin
fun increaseFontSize() {
    val current = _uiState.value.fontSize
    if (current < MAX_FONT_SIZE) {
        _uiState.value = _uiState.value.copy(fontSize = (current + FONT_STEP).coerceAtMost(MAX_FONT_SIZE))
    }
}
```

**المشكلة الثانية — حدود الـ if:**
الدالة تستخدم `if (current < 37f)` ولكن إذا زادت القيمة لأي سبب عن `37f` (bug أو state corruption)، الـ condition سيكون false ولكن القيمة الخاطئة ستبقى. الأصح استخدام `coerceIn`:

```kotlin
_uiState.value = _uiState.value.copy(
    fontSize = (current + FONT_STEP).coerceIn(MIN_FONT_SIZE, MAX_FONT_SIZE)
)
```

**المشكلة الثالثة — الـ step قد يتجاوز الحد:**
إذا كان `current = 36f` و step = `2f`، النتيجة `38f` ستتجاوز الحد. الحل: `coerceAtMost`.

**لماذا `companion object` وليس داخل class؟**
- `const val` في companion object تُحوَّل إلى static field في bytecode — لا overhead
- Top-level const val تؤدي إلى public static field يمكن الوصول إليه من أي مكان (تلوث namespace)

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف مفهوم magic numbers ولم هي مشكلة | |
| يعرف `const val` و `companion object` | |
| يكتشف مشكلة الحدود (coerceIn vs if) | |
| يعرف `coerceIn` و `coerceAtMost` و `coerceAtLeast` | |

**النقاط الحمراء:**
- ❌ عدم رؤية أن الأرقام 21 و 37 و 2 هي magic numbers
- ❌ عدم معرفة أن `const val` تُحوَّل إلى static field بدون overhead
- ❌ عدم اكتشاف أن if (current < 37f) لا يحمي من overflow (36 + 2 = 38 > 37)

---

### س4: viewModelScope — متى يتم إلغاء الكوروتين؟

**المرجع:** أي ViewModel في المشروع، مثلاً `ReaderViewModel.kt:26-27`

```kotlin
init {
    loadChapter()
}
...
private fun loadChapter() {
    viewModelScope.launch { ... }
}
```

**السؤال:** ما هو `viewModelScope`؟ متى يتم إلغاء الـ coroutine داخله؟ ماذا يحدث لو استخدمت `GlobalScope` بدلاً منه؟ وإذا احتجت أن يستمر coroutine حتى بعد تدمير ViewModel (لحفظ بيانات مثلاً)، ماذا تفعل؟

**الإجابة النموذجية:**

**ما هو `viewModelScope`؟**
- هو `CoroutineScope` مدمج في `androidx.lifecycle.viewModelScope`
- مرتبط بـ `Dispatchers.Main.immediate` افتراضياً
- يتم إلغاؤه تلقائياً عندما يُنظّف ViewModel (`onCleared()`)

**التوقيت:**
```kotlin
ViewModel.onCleared() {
    viewModelScope.cancel()  // يتم استدعاؤها تلقائياً
}
```
- عند تدمير Activity (بعد onDestroy) — ViewModel يبقى حياً
- عند إغلاق التطبيق بالكامل — ViewModel يُنظف و viewModelScope يُلغى
- عند الاتجاه إلى Activity أخرى — ViewModel يبقى (طالما الـ Activity موجودة في back stack)

**GlobalScope:**
```kotlin
GlobalScope.launch {
    // هذا الـ coroutine سيستمر حتى بعد تدمير ViewModel
    // memory leak! ViewModel سيُجمّع ولكن الكوروتين لا يزال يعمل
}
```
- `GlobalScope` لا يرتبط بأي lifecycle
- الكوروتين يستمر حتى يكتمل أو تُلغيه يدوياً
- **يسبب memory leaks** إذا أُطلق من ViewModel

**إذا أردت استمرار العمل بعد تدمير ViewModel:**
- استخدم `WorkManager` للمهام الخلفية الطويلة (مثل تحميل ملفات)
- أو استخدم `service` / `foreground service`
- لا تستخدم `GlobalScope` أبداً في Android

**أماكن أخرى في المشروع:**
- `HomeViewModel.kt:27` — `viewModelScope.launch` لتحميل الفصول
- `SearchViewModel.kt:52,63` — `viewModelScope.launch` للبحث وتحميل المحتوى

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف viewModelScope ويشرح علاقته بـ onCleared | |
| يعرف أن GlobalScope يسبب memory leaks | |
| يعرف بدائل المهام الطويلة (WorkManager, Service) | |
| يفهم lifecycle الكامل من init إلى onCleared | |

**النقاط الحمراء:**
- ❌ "GlobalScope لا بأس به في ViewModel" — كارثة، يسبب leaking
- ❌ عدم معرفة متى بالضبط يُلغى viewModelScope
- ❌ عدم القدرة على شرح الفرق بين Activity lifecycle و ViewModel lifecycle

---

### س5: object vs class vs companion object

**المرجع:** `AppModule.kt:11`

```kotlin
object AppModule { ... }
```

**السؤال:** ما الفرق بين `object` و `class` و `companion object` في Kotlin؟ لماذا استُخدم `object` لـ AppModule بالتحديد؟ أعط مثالاً من المشروع على `companion object` أيضاً. متى تستخدم `object` بدلاً من class؟

**الإجابة النموذجية:**

| البنية | الوصف | عدد الـ instances |
|--------|-------|-------------------|
| `class` | قالب يمكن إنشاء instances متعددة منه | غير محدود |
| `object` | singleton — instance واحد فقط يُنشأ تلقائياً في أول استخدام | 1 |
| `companion object` | members ثابتة مرتبطة بـ class (static-like في Java) | 1 لكل class |

**لماذا `object AppModule`؟**
- AppModule هو **service locator** — نقطة واحدة لتوفير dependencies
- يحتاج instance واحد فقط عبر التطبيق كله
- `object` يضمن lazy initialization (يُحمَّل عند أول استخدام)
- Thread-safe تلقائياً — class loader يضمن ذلك
- لا داعي لـ synchronized / double-checked locking

**companion object في المشروع:**
لا يوجد `companion object` صريح في المشروع الحالي، ولكن الـ Factory pattern (مثل `HomeViewModel.Factory`) يمكن أن يصبح `companion object`:

```kotlin
// بدلاً من Factory منفصلة
class HomeViewModel(private val repository: KhatiraRepository) : ViewModel() {
    companion object {
        fun factory(repository: KhatiraRepository) = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T = HomeViewModel(repository) as T
        }
    }
}
```

**مقارنة مع Java:**
| Kotlin | Java |
|--------|------|
| `object MySingleton` | `public static final MySingleton INSTANCE = new MySingleton()` (مع private constructor) |
| `companion object { const val X = 1 }` | `public static final int X = 1` |
| `object` يحقق Singleton بشكل آمن | في Java تحتاج synchronized + volatile + double-check |

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف الفروق بين object, class, companion object | |
| يفهم singleton pattern ولماذا `object` هو التنفيذ الأفضل في Kotlin | |
| يعرف lazy initialization و thread-safety في `object` | |
| يستطيع شرح متى يستخدم `object` بدلاً من class | |

**النقاط الحمراء:**
- ❌ عدم معرفة أن `object` هو lazy و thread-safe تلقائياً
- ❌ الخلط بين `object` و `companion object`

---

## الجولة 2: قرارات معمارية

### س6: Manual DI vs Hilt/Dagger

**المرجع:** `AppModule.kt` بالكامل

```kotlin
object AppModule {
    private var repository: KhatiraRepository? = null

    fun provideRepository(context: Context): KhatiraRepository {
        if (repository == null) {
            repository = JsonKhatiraRepository(context.applicationContext)
        }
        return repository!!
    }
    ...
}
```

**السؤال:** لماذا اخترت الـ Manual DI (AppModule) بدلاً من Hilt/Dagger؟ اذكر 3 مزايا و 3 عيوب لكل منهما. في أي حجم مشروع ستنصح بالتبديل إلى Hilt؟ وما المشكلة في تنفيذ `provideRepository` الحالي (الـ `!!` وعدم thread-safety)؟

**الإجابة النموذجية:**

| | Manual DI (AppModule) | Hilt/Dagger |
|---|----------------------|-------------|
| **المزايا** | بسيط — 36 سطراً فقط<br>لا annotation processing (build أسرع)<br>شفاف — ترى كل شيء بوضوح<br>لا dependencies إضافية | compile-time safety — إذا نسيت provide، build يفشل<br>Scalable — آلاف الـ modules<br>Auto-generated boilerplate<br>Scoping (@Singleton, @ActivityScoped) |
| **العيوب** | لا compile-time checking — error يظهر في runtime<br>لا يصلح لمشاريع كبيرة > 10 ViewModels<br>Boilerplate يزيد يدوياً<br>ليس thread-safe (الـ `if (repo == null)` يمكن أن يُستدعى من threadين مختلفين) | Build أبطأ (annotation processing)<br>تعقيد — مفهوميًا وتقنيًا<br>منحنى تعلم<br>مكتبة كبيرة (تزيد حجم APK) |
| **الأخطاء** | الـ `!!` unsafe — يمكن أن يرمي NPE<br>الـ null check ليس thread-safe — يمكن أن يُنشأ repository مرتين | لا يوجد `!!` — Hilt يضمن أن الـ dependency موجودة دائماً |

**متى أتحول إلى Hilt؟**
- عندما يصل المشروع إلى 5+ ViewModels
- عندما تظهر الحاجة لـ scoped dependencies (مثلاً UserSession لكل Activity)
- عندما يبدأ الـ AppModule بالوصول إلى 100+ سطر

**كيف تصلح التوليفة الحالية؟**
```kotlin
object AppModule {
    // @Volatile + synchronized للـ thread-safety
    @Volatile
    private var repository: KhatiraRepository? = null

    @Synchronized
    fun provideRepository(context: Context): KhatiraRepository {
        return repository ?: JsonKhatiraRepository(context.applicationContext).also { repository = it }
    }
}
```

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم trade-offs بين manual DI و Hilt | |
| يعرف متى يكون manual DI كافياً ومتى لا | |
| يكتشف مشاكل التعليمات البرمجية الحالية (`!!` و thread-safety) | |
| يقدم حلولاً عملية للمشاكل الحالية | |

**النقاط الحمراء:**
- ❌ "Manual DI دائمًا أفضل" — ليس صحيحاً، له حدود
- ❌ عدم رؤية مشكلة الـ `!!` والـ `null check`
- ❌ عدم معرفة `@Volatile` و `@Synchronized` في Kotlin

---

### س7: لماذا `order` في Page؟

**المرجع:** `Page.kt:13` + `ReaderScreen.kt:301` + `ReaderViewModel.kt:73`

```kotlin
// Page.kt
data class Page(
    val index: Int,
    val titles: List<String>,
    val subtitles: List<String>,
    val texts: List<String>,
    val ayahs: List<String>,
    val footer: String?,
    val order: List<String>  // ← لماذا هذا؟
)

// ReaderScreen.kt:301
for (field in page.order) {
    when (field) { ... }
}
```

**السؤال:** لماذا يوجد حقل `order` في Page بدلاً من ترتيب ثابت مثل `titles` أولاً ثم `subtitles` ثم `texts`...؟ اذكر مشكلة في تنفيذ `PageContent` في `ReaderScreen.kt` تتعلق بـ index counters (titleIndex, subtitleIndex...). ما الاختبار الذي يمكن أن يفشل بسبب هذا التنفيذ؟

**الإجابة النموذجية:**

**لماذا `order`؟**
- كل صفحة يمكن أن يكون لها ترتيب عرض مختلف
- صفحة قد تبدأ بـ "ayah" (آية قرآنية) ثم "texts" ثم "titles"
- صفحة أخرى قد تبدأ بـ "titles" ثم "subtitles" ثم "ayahs"
- هذا التصميم **يُفصل البيانات عن العرض** — الـ order جزء من البيانات وليس من الكود
- المقارنة: في تطبيق عادي، سيكون الترتيب ثابتاً في XML/Compose. هنا كل صفحة تعلن ترتيبها الخاص

**المشكلة في التنفيذ الحالي — Index Counters:**

```kotlin
var titleIndex by remember { mutableIntStateOf(0) }
var subtitleIndex by remember { mutableIntStateOf(0) }
var textIndex by remember { mutableIntStateOf(0) }
var ayahIndex by remember { mutableIntStateOf(0) }
```

المشكلة: هذه الـ index counters تفترض أن `page.order` **قد يحتوي على أقل من عدد العناصر الفعلية**. ولكن ماذا لو:
- `page.order` يحتوي على "titles" مرة واحدة فقط ولكن `page.titles` تحتوي على 3 عناوين؟
- الكود الحالي سيعرض العنوان الأول فقط ويتجاهل الباقي

الـ `order` يفترض علاقة 1:1 بين entry في `order` وعنصر واحد من القائمة، لكن التسمية جمع (titles, texts) توحي بوجود عناصر متعددة.

**الأصح:** التأكد من أن عدد entries في `order` لكل field يطابق حجم القائمة. أو استخدام `forEachIndexed` للتعامل مع جميع العناصر.

**اختبار يفشل:**
```
Page(
    titles = ["العنوان الأول", "العنوان الثاني"],
    order = ["titles"]  // ← entry واحد فقط
)
```
النتيجة الحالية: يظهر "العنوان الأول" فقط. المتوقع: يظهر كلاهما.

**الحل الأفضل:**
```kotlin
for (field in page.order) {
    val values = when (field) {
        "titles" -> page.titles
        "subtitles" -> page.subtitles
        "texts" -> page.texts
        "ayahs" -> page.ayahs
        "footer" -> listOfNotNull(page.footer)
        else -> emptyList()
    }
    values.forEach { text -> renderText(field, text) }
}
```

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم لماذا order مفصول في البيانات وليس في الكود | |
| يكتشف مشكلة index counters (1:1 assumption مع وجود قوائم) | |
| يقترح حلاً أفضل (iterating على القيم مباشرة) | |
| يعرف كيف يكتب اختباراً لهذه الحالة | |

**النقاط الحمراء:**
- ❌ عدم فهم أن `order` هو **جزء من البيانات وليس منطق عرض**
- ❌ اكتفاء بقراءة `order` دون فهم فلسفة التصميم
- ❌ عدم اكتشاف مشكلة الـ 1:1 ratio بين entries والقوائم

---

### س8: @SerialName — دور Serialization

**المرجع:** `Chapter.kt:9`

```kotlin
@Serializable
data class Chapter(
    val id: String,
    @SerialName("order_index") val orderIndex: Int,
    val title: String,
    val pages: List<Page>
)
```

**السؤال:** ماذا تفعل `@SerialName("order_index")`؟ ماذا يحدث لو أزلت هذا الـ annotation؟ ما العملية العكسية (serialization) — ماذا سيكون اسم الحقل في JSON الناتج؟ وكيف تتعامل kotlinx.serialization مع الفرق بين `orderIndex` (camelCase) و `order_index` (snake_case)؟

**الإجابة النموذجية:**

**وظيفة @SerialName:**
- تحدد الاسم الدقيق للحقل في JSON
- بدونها، kotlinx.serialization يستخدم اسم الـ property في Kotlin
- مع `@SerialName("order_index")`، الـ JSON يتوقع `order_index` وليس `orderIndex`

**ماذا يحدث لو أزلته؟**
```kotlin
// JSON: { "id": "1", "order_index": 0, "title": "..." }
// Kotlin: val orderIndex: Int
// بدون @SerialName → لا يجد "orderIndex" في JSON → يفشل parsing
// إلا إذا استخدمت Json { ignoreUnknownKeys = true }
```
- سيبحث عن حقل `orderIndex` في JSON
- لن يجده (لأن الاسم في JSON هو `order_index`)
- إما يفشل أو يضع القيمة الافتراضية (إن وجدت)
- `ignoreUnknownKeys = true` (الموجود في `JsonKhatiraRepository.kt:12`) يمنع الفشل ولكن `orderIndex` سيأخذ القيمة الافتراضية لـ Int وهي `0` ← خطأ صامت!

**العملية العكسية (Serialization):**
- `@SerialName` يعمل في الاتجاهين (deserialization → serialization)
- `chapter.orderIndex` → JSON: `"order_index": 5`
- `Kotlin: chapter.orderIndex = 5` → `JSON: { "order_index": 5 }`

**بديل شامل — Naming Strategy:**
يمكنك ضبط naming strategy عالمياً بدلاً من annotation لكل حقل:
```kotlin
private val jsonDecoder = Json {
    ignoreUnknownKeys = true
    namingStrategy = JsonNamingStrategy.SnakeCase
}
```
هذا سيُحوّل كل camelCase Kotlin إلى snake_case JSON تلقائياً.

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم @SerialName وعلاقته بـ JSON mapping | |
| يعرف اتجاهي Serialization (قراءة وكتابة) | |
| يعرف `ignoreUnknownKeys` وتأثيرها على القيم الافتراضية | |
| يعرف بديل naming strategy | |

**النقاط الحمراء:**
- ❌ عدم معرفة أن `@SerialName` هو bidirectional
- ❌ عدم فهم أن `ignoreUnknownKeys` + default value = خطأ صامت
- ❌ عدم معرفة `JsonNamingStrategy.SnakeCase`

---

### س9: Caching — لماذا ولماذا لا؟

**المرجع:** `JsonKhatiraRepository.kt:10-15`

```kotlin
private var cachedContent: KhatiraContent? = null

override suspend fun getContent(): KhatiraContent {
    cachedContent?.let { return it }
    val jsonString = context.assets.open("khatira_content.json")
        .bufferedReader().use { it.readText() }
    val content = jsonDecoder.decodeFromString<KhatiraContent>(jsonString)
    cachedContent = content
    return content
}
```

**السؤال:** explain the caching strategy. ما فائدتها؟ ما مخاطرها؟ ماذا يحدث لو تغير ملف JSON في الخلفية (مثلاً بعد تحديث عبر Google Play Asset Delivery)؟ كيف تجعل الـ cache مُحدَّثة دون إعادة تشغيل التطبيق؟

**الإجابة النموذجية:**

**لماذا الـ cache؟**
- تجنب قراءة الملف (I/O) وفك التشفير (parsing) في كل مرة
- ملف JSON حجمه ~849KB و ~10000 سطر
- بدون cache: كل `getChapter()` تقرأ الملف وتفك تشفيره → بطيء وغير ضروري
- مع cache: مرة واحدة فقط، ثم كل requests تأخذها من الذاكرة

**المخاطر:**
1. **Stale data:** إذا تغير الملف بعد أول قراءة (مثلاً تحديث assets)، التطبيق لا يرى التغيير
2. **Memory:** 849KB في الذاكرة طوال عمر التطبيق (مقبول ولكن يجب معرفته)
3. **No invalidation:** لا توجد آلية لإعادة التحميل

**ماذا لو تغير الملف بعد cache؟**
- التطبيق لا يرى التغيير أبداً حتى إعادة التشغيل (وبعض الحالات حتى إعادة التشغيل لا تكفي لأن assets ثابتة في APK)
- الحل: `Application` class يمكن أن يمسح cache عند `onCreate` (لكن assets لا تتغير)

**كيف نجعلها محدثة؟**
1. **File watcher:** مراقبة تغييرات الملف (لا ينطبق على assets — فهي داخل APK)
2. **Force refresh:** دالة `invalidateCache()` يتم استدعاؤها يدوياً
3. **Version check:** مقارنة `version` في JSON مع آخر version معروف
4. **الأفضل:** استخدم `lastModified` للملف إذا كان في نظام الملفات (لا ينطبق على assets)

**تحسين cache:**
```kotlin
fun invalidateCache() {
    cachedContent = null
}
```

**مقارنة مع Room (SQLite):**
| | In-memory cache | Room |
|---|----------------|------|
| السرعة | أسرع (لا Disk I/O) | أبطأ قليلاً |
| الـ Persistence | لا — يختفي عند kill | نعم — يبقى |
| التعقيد | لا شيء | يحتاج DAO, Entity, Migration |
| المناسب لـ | بيانات JSON ثابتة صغيرة | بيانات متغيرة أو كبيرة |

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم caching strategy ولماذا | |
| يعرف مخاطر stale data | |
| يقترح تحسينات (invalidateCache, version check) | |
| يقارن بـ Room/DB بوعي | |

**النقاط الحمراء:**
- ❌ عدم فهم أن cache لا يُحدَّث تلقائياً
- ❌ عدم معرفة أن assets داخل APK ولا يمكن تغييرها
- ❌ عدم ذكر stale data كمشكلة

---

### س10: Single JSON vs Database

**المرجع:** `JsonKhatiraRepository.kt` بالكامل

**السؤال:** لماذا استخدمت ملف JSON واحد بدلاً من Room database أو ملفات متعددة؟ ما هي الـ trade-offs الثلاثة الرئيسية لكل خيار؟ كيف ستتعامل مع تحديث المحتوى (إضافة صفحات/فصول جديدة) بعد إطلاق التطبيق؟

**الإجابة النموذجية:**

| | Single JSON | Room/SQLite | Multiple JSON files |
|---|-------------|-------------|---------------------|
| **البساطة** | الأبسط — 32 سطراً | معقد — DAO, Entity, Migration | بسيط — ملف واحد لكل فصل |
| **أداء القراءة** | ~849KB في الذاكرة | تجزئة — يقرأ فقط المطلوب | يقرأ ملف واحد فقط |
| **التحديثات** | يحتاج APK update | يمكن تحديث عن بعد (Firebase, API) | يمكن تحديث ملف واحد |
| **مدة التطوير** | ساعة واحدة | 3-5 أيام | ساعتان |
| **الـ Query** | لا استعلامات (بحث ثقيل) | SQL queries سريعة | محدود |
| **Schema migration** | لا يوجد — تغيير الحقول = تغيير data class | يحتاج migration scripts | يحتاج تحديث كل ملف |

**لماذا JSON هنا؟**
- **التطبيق بلا إنترنت** — لا API ولا تحديث عن بعد
- المحتوى ثابت — 34 فصل، ~532 صفحة، لا يتغير
- المشروع صغير — لا داعي لتعقيد Room
- الـ JSON يأتي من Flutter original — سهولة التحويل

**التحديثات بعد الإطلاق:**
- مع JSON واحد: يجب تحديث APK كامل → Play Store update
- الحل الأفضل: اترك JSON، وأضف optional remote config مع Firebase Remote Config
- أو استخدم Android App Bundler's Play Asset Delivery لتحديث assets فقط دون APK

**متى تتحول إلى Room؟**
- عندما يحتاج المحتوى تحديثات متكررة
- عندما تريد search متقدم (SQL FTS)
- عندما تصبح البيانات > 5MB
- عندما تريد علاقات (Relational data)

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يقارن بوعي بين JSON, Room, multiple files | |
| يفهم trade-offs لكل خيار | |
| يشرح لماذا JSON هو الأفضل في هذا السياق المحدد | |
| يعرف استراتيجيات التحديث (Play Asset Delivery, Remote Config) | |

**النقاط الحمراء:**
- ❌ تبرير اختيار JSON بدون فهم ظروف المشروع (offline, content size, update frequency)
- ❌ عدم ذكر Play Asset Delivery أو Remote Config كبديل

---

## الجولة 3: تتبع التدفق (Deep Dive)

### س11: المسار الكامل — من HomeScreen إلى ReaderScreen

**المراجع:**
- `MainActivity.kt:14-26`
- `NavGraph.kt:14-60`
- `HomeScreen.kt` — onChapterClick callback
- `Routes.kt:8-9`
- `ReaderScreen.kt:67-76`
- `ReaderViewModel.kt:21-42`
- `JsonKhatiraRepository.kt:14-27`

**السؤال:** اشرح بالتفصيل كل خطوة من لحظة ضغط المستخدم على أيقونة الفصل في HomeScreen إلى رؤيته للصفحة الأولى في ReaderScreen. اذكر اسم الملف ورقم السطر لكل خطوة.

**الإجابة النموذجية:**

```
[1] HomeScreen.kt — المستخدم يضغط على أيقونة الفصل
    → Button(onClick = { onChapterClick(chapter.id) })

[2] NavGraph.kt:22 — الـ callback يصل إلى NavGraph
    navController.navigate(Routes.readerRoute(chapterId))

[3] Routes.kt:8 — readerRoute يبني الـ route
    "reader/$chapterId?initialPage=$initialPage"
    → مثال: "reader/1?initialPage=0"

[4] NavGraph.kt:30-39 — الـ composable يقرأ arguments
    chapterId = backStackEntry.arguments?.getString("chapterId")
    initialPage = backStackEntry.arguments?.getInt("initialPage") ?: 0

[5] NavGraph.kt:42 — يُنشئ ReaderScreen
    ReaderScreen(chapterId = chapterId, initialPage = initialPage)

[6] ReaderScreen.kt:72 — viewModel يُنشأ
    viewModel: ReaderViewModel = viewModel(
        key = chapterId,  // → ViewModel مختلف لكل فصل
        factory = AppModule.provideReaderViewModelFactory(context, chapterId)
    )

[7] AppModule.kt:26-30 — Factory تُنشئ ReaderViewModel
    ReaderViewModel.Factory(repository, chapterId)

[8] ReaderViewModel.kt:21-23 — init يُنشِّط loadChapter()
    viewModelScope.launch { ... }

[9] JsonKhatiraRepository.kt:14-23 — getContent() يُقرأ JSON
    assets.open("khatira_content.json").bufferedReader().readText()
    → decodeFromString<KhatiraContent>(json)
    → cache

[10] JsonKhatiraRepository.kt:26 — getChapter(chapterId)
    getContent().chapters.find { it.id == chapterId }

[11] ReaderViewModel.kt:30-33 — uiState يُحدَّث
    _uiState.value = ReaderUiState(chapter = chapter, pages = chapter.pages, isLoading = false)

[12] ReaderScreen.kt:77 — collectAsState() يسمع التغيير
    val uiState by viewModel.uiState.collectAsState()

[13] ReaderScreen.kt:82-84 — PagerState يُنشأ
    val pagerState = rememberPagerState(initialPage, pageCount = { ... })

[14] ReaderScreen.kt:227 — HorizontalPager يعرض الصفحات
    HorizontalPager(state = pagerState) { pageIndex → PageContent(page, fontSize) }
```

**الملفات المعنية (12 ملفاً):**
1. `HomeScreen.kt` — حدث الضغط
2. `NavGraph.kt` — التنقل
3. `Routes.kt` — بناء الـ route
4. `ReaderScreen.kt` — الـ UI و init ViewModel
5. `AppModule.kt` — DI
6. `ReaderViewModel.kt` — تحميل الفصل
7. `KhatiraRepository.kt` — الـ interface
8. `JsonKhatiraRepository.kt` — قراءة JSON
9. `ReaderUiState.kt` — حالة الـ UI
10. `KhatiraContent.kt` — نموذج JSON الجذر
11. `Chapter.kt` — نموذج الفصل
12. `Page.kt` — نموذج الصفحة

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يذكر كل خطوة بالترتيب الصحيح | |
| يذكر أسماء الملفات وأرقام الأسطر بدقة | |
| يفهم متى يُنشأ ViewModel (وليس في init فقط) | |
| يشرح الربط بين collectAsState و recomposition | |

**النقاط الحمراء:**
- ❌ نسيان خطوة `key = chapterId` في إنشاء ViewModel
- ❌ عدم ذكر أن `viewModel(key) = chapterId` يضمن ViewModel مختلف لكل فصل
- ❌ عدم القدرة على تتبع التدفق الكامل من UI → ViewModel → Repository → ViewModel → UI

---

### س12: Font + — من الضغط إلى التحديث

**المرجع:** `ReaderScreen.kt:157-163` + `ReaderViewModel.kt:51-55` + `PageContent` في `ReaderScreen.kt:235-238`

**السؤال:** تتبع بالكامل من لحظة ضغط المستخدم على أيقونة "+" للخط إلى أن يتغير حجم النص على الشاشة. كيف تعمل recomposition هنا؟ لماذا يوجد `key(uiState.fontSize)`؟

**الإجابة النموذجية:**

```
[1] ReaderScreen.kt:157 — الضغط على IconButton
    IconButton(onClick = { viewModel.increaseFontSize() })

[2] ReaderViewModel.kt:51-55 — زيادة حجم الخط
    fun increaseFontSize() {
        val current = _uiState.value.fontSize  // مثال: 21f
        if (current < 37f) {
            _uiState.value = _uiState.value.copy(fontSize = current + 2f) // 23f
        }
    }

[3] MutableStateFlow يُصدر القيمة الجديدة (23f)

[4] ReaderScreen.kt:77 — collectAsState() يتلقى القيمة الجديدة
    val uiState by viewModel.uiState.collectAsState()
    → uiState.fontSize أصبح 23f

[5] ReaderScreen.kt:235 — key(uiState.fontSize) يلاحظ التغيير
    key(uiState.fontSize) {
        PageContent(page = page, fontSize = uiState.fontSize)
    }

[6] Compose runtime:
    → يرى أن `key` تغير (من 21 إلى 23)
    → يُخرج الـ composable القديم من الـ composition
    → يُنشئ composable جديد لـ PageContent بالقيمة 23f

[7] PageContent — كل Text components تستخدم fontSize الجديد
    ContentStyles.title.copy(fontSize = (fontSize + 4).sp)
    → (23 + 4) = 27sp للعناوين
    fontSize.sp → 23sp للنصوص
    ContentStyles.footer.copy(fontSize = (fontSize - 4).sp)
    → (23 - 4) = 19sp للتذييل
```

**لماذا `key(uiState.fontSize)`؟**
- بدون `key`، Compose قد يعيد استخدام نفس composable إذا ظل الـ Composition "يعتقد" أن المحتوى لم يتغير
- `key` يجبر Compose على معاملة هذا الـ composable **كجديد** عند تغير fontSize
- هذا يضمن أن كل Text components تُعاد إنشاؤها بالقيمة الجديدة
- بدونه، قد لا ترى بعض الـ Text components التحديث لأن Compose يحاول diffing

**لماذا هو مهم هنا تحديداً؟**
- `PageContent` يحتوي على `rememberScrollState()` (سطر 289)
- `remember` في Compose يُحتفظ به طالما الـ composable في الـ Composition
- `key` يضمن إزالة الـ composable من الـ Composition ثم إضافته مجدداً
- هذا يعيد تعيين `rememberScrollState()` — أي موضع التمرير سيعود للبداية
- نقاش: هل هذا مرغوب؟ نعم عادة لأن تغير حجم الخط يغير طول الصفحة

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يتتبع التدفق من UI → ViewModel → StateFlow → recomposition | |
| يفهم `collectAsState()` ودورها | |
| يعرف `key()` في Compose ولماذا تستخدم | |
| يفهم مفهوم recomposition و composition lifecycle | |

**النقاط الحمراء:**
- ❌ عدم فهم أن `key()` يزيل ويعيد إنشاء composable
- ❌ عدم معرفة أن `remember` يرتبط بـ position في Composition tree
- ❌ عدم ذكر أن `key()` يعيد تعيين `rememberScrollState()`

---

### س13: Search — كيف يعمل البحث؟

**المرجع:** `SearchViewModel.kt:61-101` + `remove_search_diacritics.kt:3-6`

**السؤال:** شرح كامل لآلية البحث. كيف تعمل إزالة التشكيل (diacritic removal)؟ ما الـ performance bottleneck في التنفيذ الحالي؟ كيف تحسّن الأداء إذا كان المستخدم يكتب بسرعة؟

**الإجابة النموذجية:**

**آلية البحث:**
```
[1] المستخدم يكتب → TextField.onValueChange(query)
[2] SearchScreen → viewModel.search(query)
[3] إذا query فارغة → نتائج فارغة
[4] query.normalized = removeSearchDiacritics(query.lowercase())
[5] لكل فصل → لكل صفحة → لكل field في page.order:
    - value.normalized = removeSearchDiacritics(value.lowercase())
    - value.normalized.contains(query.normalized) ← match?
[6] كل الـ matches تُجمع في SearchResult(chapter, page, pageIndex, matchedField, matchedText)
[7] uiState تُحدَّث → LazyColumn يعيد الرسم
```

**كيف تعمل إزالة التشكيل:**
```kotlin
fun removeSearchDiacritics(text: String?): String {
    if (text == null) return ""
    return text.filter { it in '\u0621'..'\u064A' || it.isWhitespace() }
}
```
- تحذف كل الأحرف العربية خارج نطاق U+0621–U+064A (الحروف العربية المجردة)
- بناء المسافة البيضاء
- هذا يزيل: الفتحة، الضمة، الكسرة، السكون، الشدة، التنوين، المدة...
- مثال: "رَّحِيم" → "رحيم" و "ٱلرَّحۡمَـٰن" → "الرحمن"
- **تحذير:** قد تحذف أحرفاً خارج النطاق مثل: ة (U+0629 ← محفوظة ضمن النطاق ✅)، لكن الألف المقصورة ى (U+0649 ← محفوظة ✅) والهمزة على الكرسي ئ (U+0626 ← محفوظة ✅). فعلاً النطاق يغطي معظم الحروف العربية.

**الـ Performance Bottleneck:**
- كل ضغطة: 34 فصل × ~532 صفحة × ~5 fields لكل صفحة = ~2,660 تكرار
- كل تكرار: `removeSearchDiacritics` تُنشئ String جديد (حجمه ≈ حجم النص الأصلي)
- هذا يعني: كل ضغطة تُنشئ ~2,660 كائن String في الـ Heap
- **على مقطع "رَّحِيم":** String جديد = 5 أحرف → 2,660 × 5 = ~13,300 حرفاً تُنسخ

**التحسينات:**

**1. Debouncing:**
```kotlin
private var searchJob: Job? = null

fun search(query: String) {
    searchJob?.cancel()
    searchJob = viewModelScope.launch {
        delay(300)  // انتظر 300ms بعد آخر ضغطة
        performSearch(query)
    }
}
```

**2. Pre-normalize:**
```kotlin
// في loadContent(), احسب normalized values مرة واحدة
private var normalizedFields: Map<Page, Map<String, List<String>>> = emptyMap()

fun preNormalize() {
    normalizedFields = cachedContent?.chapters?.flatMap { chapter ->
        chapter.pages.flatMap { page ->
            page.order.map { field ->
                val values = when (field) { ... }
                page to (field to values.map { removeSearchDiacritics(it.lowercase()) })
            }
        }
    }?.groupBy({ it.first }, { it.second })?.mapValues { it.value.toMap() } ?: emptyMap()
}
```

**3. استخدام Set بدلاً من List للـ order:**
الـ `order` هو List ولكن يمكن أن يكون Set لأن الترتيب وحيد — لا حاجة لتكرار field. هذا يسرّع التحقق قليلاً.

**4. استخدام Regex بدلاً من filter:**
```kotlin
// Current: text.filter { it in '\u0621'..'\u064A' || it.isWhitespace() }
// تحسين: حذف الأحرف الخاصة فقط بدلاً من فحص كل حرف
private val diacriticsRegex = Regex("[\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06ED]")
fun removeSearchDiacritics(text: String): String = text.replace(diacriticsRegex, "")
```
لكن الـ Regex قد لا يكون أسرع في Kotlin من filter على نصوص صغيرة.

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم آلية البحث بالكامل | |
| يفهم diacritic removal (المنطق والقيود) | |
| يكتشف performance bottleneck (تكرار المعالجة لكل ضغطة) | |
| يقترح تحسينات عملية (debouncing, caching, pre-normalize) | |

**النقاط الحمراء:**
- ❌ عدم فهم أن `removeSearchDiacritics` تُستدعى لكل field لكل صفحة لكل ضغطة
- ❌ عدم اقتراح debouncing
- ❌ عدم ذكر أن الـ String allocation المتكرر يسبب GC pressure

---

### س14: Navigation with Arguments — كيف يعمل الـ initialPage؟

**المرجع:** `Routes.kt:5-9` + `NavGraph.kt:30-41` + `ReaderScreen.kt:82-84` + `ReaderScreen.kt:91-97`

**السؤال:** اشرح آلية تمرير `initialPage` من أي مكان في التطبيق إلى ReaderScreen. وكيف يتم ضمان أن الصفحة الصحيحة تُعرض عند بدء التشغيل؟

**الإجابة النموذجية:**

**1. تعريف الـ Route (Routes.kt:5):**
```kotlin
const val READER = "reader/{chapterId}?initialPage={initialPage}"
```
- `{chapterId}` — path parameter (إجباري)
- `{initialPage}` — query parameter (اختياري، default = 0)

**2. بناء الـ Route (Routes.kt:8):**
```kotlin
fun readerRoute(chapterId: String, initialPage: Int = 0) =
    "reader/$chapterId?initialPage=$initialPage"
```
- مثال: `reader/1?initialPage=5` → اذهب إلى الفصل 1، الصفحة 6 (index 5)

**3. تعريف الـ Arguments (NavGraph.kt:32-37):**
```kotlin
navArgument("chapterId") { type = NavType.StringType }
navArgument("initialPage") {
    type = NavType.IntType
    defaultValue = 0
}
```
- `chapterId` من نوع String
- `initialPage` من نوع Int، default = 0

**4. استخراج الـ Arguments (NavGraph.kt:40-41):**
```kotlin
val chapterId = backStackEntry.arguments?.getString("chapterId") ?: return@composable
val initialPage = backStackEntry.arguments?.getInt("initialPage") ?: 0
```

**5. تمرير إلى ReaderScreen (NavGraph.kt:42-44):**
```kotlin
ReaderScreen(
    chapterId = chapterId,
    initialPage = initialPage,
    ...
)
```

**6. استخدام initialPage في PagerState (ReaderScreen.kt:82-84):**
```kotlin
val pagerState = rememberPagerState(
    initialPage = initialPage.coerceIn(0, (uiState.pages.size - 1).coerceAtLeast(0)),
    pageCount = { uiState.pages.size.coerceAtLeast(1) }
)
```
- `coerceIn` يضمن أن `initialPage` ضمن الحدود الصحيحة
- إذا الـ pages لا تزال `emptyList()` (لم تُحمَّل بعد)، `(pages.size - 1).coerceAtLeast(0) = 0`، و `initialPage.coerceIn(0,0) = 0` لن يعمل

**7. انتظار التحميل (ReaderScreen.kt:91-97):**
```kotlin
LaunchedEffect(uiState.isLoading) {
    if (!uiState.isLoading && uiState.pages.isNotEmpty() && initialPage > 0) {
        pagerState.scrollToPage(initialPage.coerceIn(0, uiState.pages.size - 1))
    }
}
```
هذا الـ LaunchedEffect يحل مشكلة التوقيت:
- أولاً، `rememberPagerState` يُنشأ بـ `initialPage = 0` (لأن pages لا تزال فارغة)
- ثم، بعد تحميل الفصل، `LaunchedEffect` يُنشَّط (لأن `isLoading` أصبح false)
- يقوم بالتمرير إلى `initialPage`

**المشكلة:** إذا `initialPage == 0` (الحالة الطبيعية)، LaunchedEffect لا يفعل شيئاً — وهذا صحيح.

**مشكلة أخرى:** قد يحدث flicker — pager يبدأ من 0 ثم يقفز إلى initialPage. الحل الأفضل: لا تبدأ العرض حتى يكتمل التحميل.

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يفهم route parameters و NavType | |
| يعرف path vs query parameters في Navigation | |
| يشرح مشكلة التوقيت (loading → pager → scroll) | |
| يكتشف flicker المحتمل ويقترح حلاً | |

**النقاط الحمراء:**
- ❌ عدم فهم الفرق بين `{chapterId}` و `?initialPage={initialPage}`
- ❌ عدم ذكر مشكلة التوقيت (LaunchedEffect ضروري لانتظار التحميل)
- ❌ عدم اكتشاف الـ flicker المحتمل

---

## الجولة 4: اكتشف المشاكل (Code Review)

### س15: exitProcess(0) — لماذا هو خطأ؟

**المرجع:** `alert_exit_dialog.kt:70`

```kotlin
confirmButton = {
    TextButton(onClick = { exitProcess(0) }) { ... }
}
```

**السؤال:** هذا السطر يقتل العملية مباشرة. اذكر 3 مشاكل في استخدام `exitProcess(0)` في تطبيق Android. ما البديل الصحيح للخروج من التطبيق؟ ومتى يكون `exitProcess(0)` مقبولاً فعلاً في Android؟

**الإجابة النموذجية:**

**المشاكل الثلاث:**

1. **Bypass Activity lifecycle:**
   - `onDestroy()` لا يُستدعى ← لا تنظيف للموارد
   - `onPause()` لا يُستدعى ← لا حفظ للحالة
   - لا يتم حفظ `savedInstanceState`
   - التطبيق يختفي فجأة — ليس سلوكاً Androidياً طبيعياً

2. **Bypass Application lifecycle:**
   - `Application.onTerminate()` لا يُستدعى أبداً
   - أي resources في `Application` لا تُحرر
   - أي Services لا تُوقف ← قد تبقى في الخلفية

3. **Kills entire process:**
   - يقتل كل threads و coroutines في الـ process
   - أي عمليات خلفية (مثل WorkManager tasks) تُقتل فجأة
   - أي عمليات كتابة إلى ملف/DB قد تُقطع → corrupt data
   - **Android System قد تعيد تشغيل التطبيق** — لأنها تظن أن التطبيق crash

**البديل الصحيح:**
```kotlin
// الخيار 1: finish() في Activity
(activity as? ComponentActivity)?.finish()

// الخيار 2: finishAffinity() — يُغلق كل Activities في الـ Task
@Composable
fun BackPressHandlerWithExitDialog(activity: ComponentActivity) {
    ...
    confirmButton = {
        TextButton(onClick = { activity.finishAffinity() }) { ... }
    }
}

// الخيار 3: moveTaskToBack(true) — بدلاً من الإنهاء، أرسل التطبيق للخلفية
(activity as? Activity)?.moveTaskToBack(true)
```

**لماذا `finishAffinity()` هو الأفضل؟**
- يُغلق كل Activities
- يضمن استدعاء onDestroy() لكل Activity
- يُستدعى onPause() للمستخدم النهائي
- لا يقتل process — Android يمكن أن يبقيه حياً للتشغيل السريع لاحقاً

**متى يكون `exitProcess(0)` مقبولاً؟**
1. **في الخلفية فقط** بعد خطأ لا يمكن التعافي منه (unrecoverable error)
2. **في مكتبة C/C++ عبر JNI** (كحل أخير)
3. **في تطبيقات root/magisk** (ليست تطبيقات Play Store عادية)
4. **في اختبارات Unit tests** (على JVM وليس Android)

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف لماذا exitProcess خطأ في Android | |
| يذكر 3 مشاكل محددة | |
| يقدم بديلاً صحيحاً (finish, finishAffinity) | |
| يعرف متى يكون استخدامه مقبولاً | |

**النقاط الحمراء:**
- ❌ "exitProcess = finish()" — خطأ فادح، الفرق بين bypass lifecycle و normal lifecycle
- ❌ عدم ذكر أن Android System قد تعيد تشغيل التطبيق (ظنًا أنه crash)
- ❌ عدم ذكر `finishAffinity()`

---

### س16: Hardcoded Passwords في VCS

**المرجع:** `app/build.gradle.kts:22-27`

```kotlin
signingConfigs {
    create("release") {
        storeFile = file("salam-release.jks")
        storePassword = "salam123"
        keyAlias = "salam"
        keyPassword = "salam123"
    }
}
```

**السؤال:** اكتشف الـ security issue الخطير هنا. ما المخاطر؟ كيف تصلحه بثلاث طرق مختلفة؟

**الإجابة النموذجية:**

**المشكلة:**
- **Credential hardcoding** — كلمة المرور موجودة في الكود
- **Version control** — الكود في git ← كل من لديه access للمستودع يملك كلمة مرور التوقيع
- **Keystore في workspace** — `salam-release.jks` قد يكون مضموماً في git أيضاً

**المخاطر:**
1. **Sideloading ضار:** أي شخص لديه الكود يمكنه بناء APK موقع باسمك وتوزيعه
2. **نشر تحديث ضار:** لو key store متاح، يمكنهم نشر تحديث ضار يحمل نفس التوقيع
3. **انتحال الهوية:** توقيع APK يثبت ملكيتك — إذا سُرق، يمكن انتحال هويتك
4. **رفض Google Play:** Google يرفض تطبيقات بها credentials مكشوفة

**الطريقة 1 — keystore.properties (ملف خارجي):**
```properties
# keystore.properties (في .gitignore)
storeFile=salam-release.jks
storePassword=actual_password_here
keyAlias=salam
keyPassword=actual_password_here
```

```kotlin
// build.gradle.kts
val keystoreProperties = Properties()
val keystoreFile = rootProject.file("keystore.properties")
if (keystoreFile.exists()) {
    keystoreProperties.load(keystoreFile.inputStream())
}

signingConfigs {
    create("release") {
        storeFile = file(keystoreProperties.getProperty("storeFile") ?: "")
        storePassword = keystoreProperties.getProperty("storePassword") ?: ""
        keyAlias = keystoreProperties.getProperty("keyAlias") ?: ""
        keyPassword = keystoreProperties.getProperty("keyPassword") ?: ""
    }
}
```

**الطريقة 2 — Environment Variables:**
```kotlin
signingConfigs {
    create("release") {
        storeFile = file(System.getenv("SALAM_KEYSTORE_FILE") ?: "")
        storePassword = System.getenv("SALAM_KEYSTORE_PASSWORD") ?: ""
        keyAlias = System.getenv("SALAM_KEY_ALIAS") ?: ""
        keyPassword = System.getenv("SALAM_KEY_PASSWORD") ?: ""
    }
}
```

**الطريقة 3 — Signing Report + CI/CD:**
- احتفظ بالمفاتيح في CI/CD secrets (GitHub Secrets, GitLab CI Variables)
- build فقط على CI وليس محلياً
- الـ local build يستخدم debug keystroke تلقائي

**ما يجب فعله فوراً:**
1. إزالة `salam-release.jks` من git (أضفه لـ `.gitignore`)
2. سحب commit من git history (أو تدوير المفتاح — generate new keystore)
3. استخدام `keystore.properties` في `.gitignore`

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يكتشف hardcoded credentials | |
| يشرح 3 مخاطر أمنية محددة | |
| يقدم 3 حلول عملية مختلفة | |
| يعرف git filter-branch/BFG لتطهير التاريخ | |

**النقاط الحمراء:**
- ❌ "سأخبئها في gitignore فقط" — التاريخ لا يزال مكشوفاً
- ❌ عدم ذكر أن keystore نفسه قد يكون في git
- ❌ عدم اقتراح تدوير key pair (generate new keystore)

---

### س17: Silent Exception — ماذا يرى المستخدم عند الفشل؟

**المرجع:** `HomeViewModel.kt:31-32`

```kotlin
try {
    val chapters = repository.getAllChapters()
    _uiState.value = HomeUiState(chapters = chapters, isLoading = false)
} catch (e: Exception) {
    _uiState.value = HomeUiState(isLoading = false)  // ← chapters فارغة
}
```

**السؤال:** ماذا يرى المستخدم إذا فشل تحميل الفصول (مثلاً ملف JSON تالف)؟ ما الخطأ في معالجة الخطأ هنا؟ اكتب التنفيذ الصحيح مع معالجة 3 حالات: تحميل، خطأ، فارغ.

**الإجابة النموذجية:**

**المشكلة:**
```kotlin
catch (e: Exception) {
    _uiState.value = HomeUiState(isLoading = false)
    // chapters = emptyList() افتراضياً
}
```
المستخدم يرى شاشة **فارغة تماماً** — بدون رسالة خطأ، بدون retry. يظن التطبيق "علق" أو "فارغ".

**لماذا هو خطير؟**
- المستخدم لا يعرف أن هناك مشكلة
- المستخدم لا يعرف هل المشكلة في التطبيق أم الإنترنت (لا يوجد إنترنت أصلاً)
- المستخدم قد يحذف التطبيق
- لا توجد طريقة لإعادة المحاولة

**المقارنة مع ReaderViewModel (الذي يتعامل مع الخطأ بشكل أفضل):**
```kotlin
// ReaderViewModel.kt:38-40 — أفضل قليلاً
} catch (e: Exception) {
    _uiState.value = ReaderUiState(error = e.message)  // ← يعرض رسالة الخطأ
}
```

**التنفيذ الصحيح:**

```kotlin
data class HomeUiState(
    val chapters: List<Chapter> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null  // ← إضافة error state
)

class HomeViewModel(private val repository: KhatiraRepository) : ViewModel() {
    private fun loadChapters() {
        viewModelScope.launch {
            _uiState.value = HomeUiState(isLoading = true)
            try {
                val chapters = repository.getAllChapters()
                if (chapters.isEmpty()) {
                    _uiState.value = HomeUiState(error = "لا توجد فصول متاحة")
                } else {
                    _uiState.value = HomeUiState(chapters = chapters, isLoading = false)
                }
            } catch (e: Exception) {
                _uiState.value = HomeUiState(
                    error = e.message ?: "حدث خطأ أثناء تحميل المحتوى"
                )
            }
        }
    }
}
```

**في HomeScreen — عرض الحالات الثلاث:**

```kotlin
when {
    uiState.isLoading -> LoadingIndicator()
    uiState.error != null -> ErrorView(
        message = uiState.error,
        onRetry = { viewModel.loadChapters() }  // ← retry
    )
    uiState.chapters.isEmpty() -> EmptyView()
    else -> ChapterList(chapters = uiState.chapters)
}
```

**مبدأ عام:**
- **Loading** ≠ **Empty** ≠ **Error**
- لكل حالة presentation مختلف
- كل حالة يجب أن تعرض clear action للمستخدم

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يكتشف أن الخطأ يُبتلع صامتاً | |
| يشرحان المستخدم يرى شاشة فارغة | |
| يضيف error field إلى UiState | |
| يقدم 3 حالات UI (loading, error, empty, content) | |

**النقاط الحمراء:**
- ❌ "عادي، JSON لن يتلف" — نحن نختبر معالجة الأخطاء وليس احتمال حدوثها
- ❌ عدم إضافة `retry` mechanism
- ❌ عدم اتباع مبدأ sealed class / ثلاث حالات

---

### س18: Performance — Search على كل ضغطة

**المرجع:** `SearchViewModel.kt:61-99`

**السؤال:** البحث الحالي يُعيد معالجة كل النص في كل ضغطة مفتاح. كم عملية تتم في كل ضغطة؟ كيف تقيس الأداء (profiling)؟ كيف تحسّن بأربع طرق مختلفة؟

**الإجابة النموذجية:**

**كم عملية في كل ضغطة؟**

| العملية | العدد التقريبي |
|---------|----------------|
| فصول | 34 |
| صفحات في كل فصل | ~15.6 (532/34) |
| حقول في كل صفحة (order.size) | ~5 |
| **إجمالي تكرارات الـ loop** | **34 × ~15.6 × 5 ≈ 2,650** |
| استدعاءات `removeSearchDiacritics` | 2,650 |
| استدعاءات `lowercase()` | 2,650 |
| استدعاءات `contains()` | 2,650 |
| إنشاء كائنات String | 2,650 كائن جديد |
| **إجمالي العمليات (تقريباً)** | **~13,250 لكل ضغطة** |

**كيف تقيس الأداء:**
1. **Android Studio CPU Profiler:** `View > Tool Windows > Profiler` → CPU → record method trace
2. **Log/Timing:** `measureTimeMillis { search(query) }`
3. **Systrace:** `Android Studio > Profiler > CPU > System Trace`

**أربع تحسينات:**

**1. Debounce (الأهم):**
```kotlin
private var searchJob: Job? = null

fun search(query: String) {
    _uiState.value = _uiState.value.copy(query = query, isSearching = true)
    searchJob?.cancel()
    searchJob = viewModelScope.launch {
        delay(300)  // انتظر حتى يتوقف المستخدم عن الكتابة
        performSearch(query)
    }
}

private suspend fun performSearch(query: String) { ... }
```

**2. Pre-normalize (أكبر توفير):**
```kotlin
// في init، احسب normalized versions مرة واحدة
private val normalizedContent: Map<Chapter, Map<Page, Map<String, List<String>>>> by lazy {
    buildNormalizedIndex()
}
```

**3. Search منفصل في coroutine:**
```kotlin
fun search(query: String) {
    _uiState.value = _uiState.value.copy(query = query, isSearching = true)
    viewModelScope.launch(Dispatchers.Default) {  // ← background thread
        ...
        _uiState.value = _uiState.value.copy(results = results, isSearching = false)
    }
}
```
لاحظ أن `_uiState` التحديث يجب أن يكون على Main thread — ولكن Compose StateFlow يمكن تحديثه من أي thread.

**4. الحد من النتائج:**
```kotlin
val results = mutableListOf<SearchResult>()
for (chapter in chapters) {
    if (results.size >= MAX_RESULTS) break  // ← 100 نتيجة كافية
    ...
}
```

**التحسين المتوقع:**
| التحسين | تحسين الأداء التقريبي |
|---------|-----------------------|
| Debounce | 95% أقل (من 2650/ضغطة إلى 2650/آخر ضغطة) |
| Pre-normalize | 50% أقل (لا حاجة لـ removeDiacritics لكل قيمة) |
| Dispatchers.Default | لا يحسّن السرعة ولكنه يمنع ANR |
| Limit results | حسب القيمة — قد يكون 10% |

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يحسب حجم العملية (عدد التكرارات) | |
| يعرف أدوات القياس (Profiler, measureTimeMillis) | |
| يقترح debounce كأول تحسين | |
| يقترح pre-normalize كأكبر توفير حسابي | |

**النقاط الحمراء:**
- ❌ عدم ذكر debounce (الأهم)
- ❌ عدم ذكر pre-normalize (أكبر توفير حسابي)
- ❌ عدم ذكر Dispatchers.Default لمنع ANR

---

### س19: compileSdk = 37 — خطأ في التوليفة

**المرجع:** `app/build.gradle.kts:9`

```kotlin
android {
    namespace = "com.islamux.khatir"
    compileSdk = 37  // ← مشكلة
```

**السؤال:** ما المشكلة في `compileSdk = 37`؟ اذكر الفرق بين compileSdk و minSdk و targetSdk. ماذا يحدث إذا بنيت التطبيق بـ compileSdk غير صحيح؟

**الإجابة النموذجية:**

**المشكلة:**
- API Level 37 **غير موجود** في أي إصدار Android
- أعلى API level موجود هو API 36 (Android 16 "Baklava")
- هذا إما **typo** (36 → 37) أو استخدام SDK لم يُطرح بعد

**الفرق بين الأنواع الثلاثة:**

| المعيار | الوظيفة | معناه |
|---------|---------|-------|
| `compileSdk` | أي API مسموح استخدامه في الكود | يحدد أقصى API يمكنك استدعاء دواله |
| `minSdk` | أقل إصدار Android يدعم التطبيق | يحدد الحد الأدنى للأجهزة |
| `targetSdk` | إصدار Android الذي صُمم التطبيق له | يحدد سلوك التطبيق على API أحدث |

**التأثير:**
```kotlin
compileSdk = 37      // يقول: "أريد استخدام API 37"
minSdk = 24          // أقل جهاز: Android 7.0 (API 24)
targetSdk = 36       // صمم لـ Android 16 (API 36)
```

**العلاقة:**
- `minSdk <= targetSdk <= compileSdk` (يجب أن يكون صحيحاً)
- عادة: `minSdk ≤ targetSdk ≤ compileSdk`
- هنا: `24 ≤ 36 ≤ 37` — العلاقة صحيحة رياضياً ولكن 37 غير موجود

**ماذا يحدث؟**
- **إذا 37 غير موجود محلياً:** الـ build يفشل — `compileSdk 37 not found`
- **إذا 37 موجود (preview SDK):** يمكن البناء ولكن الكود قد يستخدم API لم يُطرح بعد ← الجهاز يرفض التثبيت
- **إذا تم البناء بمكتبة 36 باسم 37:** compile error لأن API 36 مساراته مختلفة

**التصحيح:**
```kotlin
compileSdk = 36  // ← التصحيح الصحيح
```

**ملاحظة:** الرقم الحقيقي يجب أن يكون `35` أو `36` حسب البيئة. API 35 = Android 15, API 36 = Android 16.

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف أن API 37 غير موجود | |
| يشرح الفرق بين compileSdk, minSdk, targetSdk | |
| يعرف ماذا يحدث عند build بـ SDK غير صحيح | |
| يصحح الرقم إلى القيمة الصحيحة | |

**النقاط الحمراء:**
- ❌ عدم معرفة أحدث API level (36)
- ❌ عدم الفرق بين أنواع SDK
- ❌ "ال build سينجح" — خطأ، SDK غير موجود سيفشل الـ build

---

## الجولة 5: أسئلة نظرية عامة

### س20: Activity Lifecycle + ViewModel Survival

**المرجع:** `MainActivity.kt:14-26` (كمرجع لتطبيق المعرفة)

**السؤال:** اشرح دورة حياة Activity في Android. كيف تنجو ViewModel من تغيير الإعدادات (مثل التدوير)؟ وما هو `onSaveInstanceState` ومتى يُستخدم مقارنةً بـ ViewModel؟

**الإجابة النموذجية:**

**دورة حياة Activity:**

```
onCreate() ← بداية (Bundle? للحالة المحفوظة)
    |
onStart() ← مرئي (ليس بالضرورة متفاعلاً)
    |
onResume() ← متفاعل + مرئي (التطبيق قيد الاستخدام)
    |
[onPause() ← غير متفاعل ولكن مرئي جزئياً (انقطاع مؤقت)]
    |
[onStop() ← غير مرئي (تطبيق آخر في المقدمة)]
    |
[onRestart() ← يعود من onStop إلى onStart]
    |
[onDestroy() ← نهاية الحياة]
```

**تغيير الإعدادات (Configuration Change):**
```
Rotation:
    MainActivity.onPause()
    MainActivity.onStop()
    MainActivity.onDestroy()   ← Activity يُدمر
    MainActivity.onCreate()    ← Activity يُعاد إنشاؤه (Bundle فارغ)
    MainActivity.onStart()
    MainActivity.onResume()
```

**كيف تنجو ViewModel؟**
```
ViewModelStore (في ComponentActivity):
  - يُحتفظ به بعد destruction
  - يُمرَّر إلى Activity الجديد
  - ViewModel.onCleared() لا يُستدعى خلال config change
  - يُستدعى فقط عندما Activity finishes (وليس restart)

ComponentActivity.onRetainNonConfigurationInstance()
  → يحتفظ بـ ViewModelStore
  → Activity الجديد يستلم ViewModelStore عبر getLastNonConfigurationInstance()
```

**ViewModel vs onSaveInstanceState:**

| | ViewModel | onSaveInstanceState |
|---|-----------|-------------------|
| **متى يُستدعى** | يعيش عبر config change، يموت عند finish | يُستدعى قبل onStop |
| **حجم البيانات** | أي حجم (ViewModel في الذاكرة) | محدود (Bundle - ~1MB) |
| **نوع البيانات** | أي نوع (list, bitmap, object) | أنواع أساسية + Parcelable/Serializable |
| **بقاء بعد process death** | ❌ لا يبقى | ✅ يبقى (لأنه يُحفظ في Bundle) |
| **متى تستخدم** | UI state, data, business logic | معرف حالة بسيط (id, scroll position) |

**في هذا المشروع:**
المشروع لا يستخدم `onSaveInstanceState` على الإطلاق — مما يعني أن البحث أو موضع القراءة يُفقد إذا قُتل التطبيق (process death).

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعدد مراحل lifecycle بالترتيب | |
| يشرح config change و ViewModelStore | |
| يقارن ViewModel و onSaveInstanceState | |
| يشرح فجوة هذا المشروع (process death) | |

---

### س21: Garbage Collection في JVM

**السؤال:** كيف يعمل Garbage Collection في الـ JVM؟ اذكر الفرق بين Generational GC و Reference Counting. هل يمكنك force GC في Kotlin؟ ومتى تحتاج إلى GC tuning في تطبيق Android؟

**الإجابة النموذجية:**

**كيف يعمل GC في JVM:**

```
Young Generation (Eden + S0 + S1):
  - كل الكائنات الجديدة تُنشأ هنا
  - Minor GC: عندما تمتلئ Eden → copy survivors إلى S0/S1
  - الكائنات التي تعيش عدة Minor GCs تُنقل إلى...

Old Generation (Tenured):
  - الكائنات طويلة العمر
  - Major GC: عندما تمتلئ Old Gen → mark + sweep + compact

Metaspace (بدلاً من PermGen):
  - Class metadata, method data
  - لا GC تلقائي — قد يتراكم
```

**أنواع GC (Java 8+):**
- **Serial GC:** خيط واحد — للأجهزة الصغيرة (Android لا يستخدمه)
- **Parallel GC:** عدة خيوط — لـ throughput
- **CMS (Concurrent Mark Sweep):** تأخير منخفض (مُهمَل في Java 9+)
- **G1GC:** الافتراضي في Java 9+ — يقسم الـ Heap إلى مناطق 1MB ويتعامل مع كل منطقة
- **ART (Android Runtime):** ليس JVM — يستخدم مترجم AOT مع مُحسّن خاص لـ GC لتقليل STW (Stop-The-World)

**ART GC في Android:**
- Concurrent, generational, compacting
- **ومع ذلك**، لا يزال هناك STW pauses (على الأقل لـ roots scanning)
- هدف ART: < 10ms تأخير لكل GC

**Reference Counting (Swift/Obj-C):**
```
كل كائن يحتفظ بـ retain count:
  retain() → count++
  release() → count--
  count == 0 → dealloc

مشكلة: retain cycles
  A → B و B → A → لا أحد يُحرر ← leak
  الحل: weak references
```

**مقارنة:**

| | JVM GC | Reference Counting |
|---|--------|-------------------|
| آلية العمل | Mark & Sweep + Copying | كل كائن يحتفظ بالعدد |
| الذاكرة العالقة (Cycles) | يُكتشف تلقائياً (GC mark phase) | لا يُكتشف (يحتاج weak refs) |
| وقفة التطبيق | STW pauses (غالباً < 10ms) | لا وقفة — متدرج |
| الأداء | عالٍ (مع GC معدل) | منخفض قليلاً (retain/release مستمر) |
| في Android | ART GC | ليس موجوداً |
| في Kotlin/Native | — | يستخدم Swift ARC على iOS |

**هل يمكن force GC؟**
```kotlin
System.gc()  // ← مجرد اقتراح لـ JVM. لا يضمن التنفيذ
Runtime.getRuntime().gc()  // ← نفس الشيء
// في Android: لا تستخدمها — الـ Runtime يدير الذاكرة أفضل منك
```

**متى تحتاج GC tuning في Android؟**
1. **كثرة الـ Allocation:** إنشاء كائنات كثيرة (مثل 2600 String في كل search) → GC المتكرر → Jank
2. **Bitmap كبير:** الصور الكبيرة في Old Gen → GC طويل → ANR
3. **Memory Leak:** Activity reference في singleton → OutOfMemoryError
4. **Large Objects:** Array كبير > 512KB → يذهب مباشرة لـ Old Gen

**في هذا المشروع:**
- Search يخلق 2600 كائن String لكل ضغطة → GC pressure
- Image(bg_reader) في كل شاشة → قد يسبب GC
- `cachedContent` في repository ~849KB في Old Gen — دائم

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يشرح Generational GC (Young, Old, Metaspace) | |
| يفهم Reference Counting ويقارن بـ GC | |
| يعرف أن System.gc() مجرد اقتراح | |
| يربط GC بـ Android jank و performance | |

---

### س22: SOLID في هذا المشروع

**السؤال:** اشرح مبادئ SOLID الخمسة مع مثال من هذا المشروع لكل مبدأ (إما تطبيق أو انتهاك).

**الإجابة النموذجية:**

**S — Single Responsibility Principle:**
> "كل class يجب أن يكون له سبب واحد فقط للتغيير."

| ✅ تطبيق | ❌ انتهاك |
|----------|----------|
| `JsonKhatiraRepository`: مسؤول عن قراءة وتخزين JSON فقط | `ReaderScreen.kt:371` — مسؤول عن: العرض، التنقل، المشاركة، التحكم بالخط — double responsibility. الحل: استخراج TopAppBar و PageContent كـ composables منفصلة |
| `ReaderViewModel`: مسؤول عن حالة القارئ فقط | |
| `AppStrings`: مسؤول عن النصوص فقط | |

**O — Open/Closed Principle:**
> "مسموح للتمديد، ممنوع للتعديل."

| ✅ تطبيق | ❌ انتهاك |
|----------|----------|
| `KhatiraRepository` interface: يمكن إضافة implement جديد (مثل `NetworkKhatiraRepository`) بدون تغيير `JsonKhatiraRepository` | |
| `ContentStyles` في Type.kt: يمكن إضافة style جديد بدون تعديل الموجود | |
| **ملاحظة:** `fieldLabel()` في SearchViewModel.kt:31-38 تستخدم `when` لجميع الحقول — إضافة حقل جديد يتطلب تعديل هذه الدالة ← انتهاك OCP | |

**L — Liskov Substitution Principle:**
> "الفئة الفرعية يجب أن تحل محل الفئة الأساسية دون تغيير سلوك البرنامج."

| ✅ تطبيق | ❌ انتهاك |
|----------|----------|
| `JsonKhatiraRepository` يطبّق `KhatiraRepository` — أي كود يستخدم `KhatiraRepository` يمكنه استخدام `JsonKhatiraRepository` دون مشكلة | لا يوجد Violation واضح (يوجد implement واحد فقط) |

**I — Interface Segregation Principle:**
> "لا تجبر class على تنفيذ واجهات لا يستخدمها."

| ✅ تطبيق | ❌ انتهاك |
|----------|----------|
| `KhatiraRepository` يحتوي على 3 دوال فقط — كلها مستخدمة: `getContent()`, `getChapter()`, `getAllChapters()` | |
| لا يوجد interface ضخم | التطبيق صغير جداً لانتهاك ISP |

**D — Dependency Inversion Principle:**
> "اعتمد على abstractions وليس concretions."

| ✅ تطبيق | ❌ انتهاك |
|----------|----------|
| ViewModels تعتمد على `KhatiraRepository` (interface) وليس `JsonKhatiraRepository` (concrete) | |
| الـ Factory pattern: `HomeViewModel.Factory` تأخذ `KhatiraRepository` وليس `JsonKhatiraRepository` | |

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف مبادئ SOLID الخمسة | |
| يقدم مثالاً حقيقياً من المشروع لكل مبدأ | |
| يفرّق بين التطبيق والانتهاك | |
| يعرف كيف يصلح الانتهاكات | |

---

### س23: Unit Testing — زيادة حجم الخط

**المرجع:** `ReaderViewModel.kt:51-55` + `ReaderViewModelTest` (لا يوجد — نحن نكتبه)

**السؤال:** اكتب unit test لـ `increaseFontSize()`. ما الذي تحتاج إلى mock؟ ماذا تختبر بالضبط (حالات الحافة)؟ كيف تتعامل مع `viewModelScope` في الاختبار؟

**الإجابة النموذجية:**

**الـ Dependencies المطلوب Mock:**
- `KhatiraRepository` — لأن `ReaderViewModel.init()` يستدعي `repository.getChapter(chapterId)`
- لا نحتاج mock لـ `ReaderUiState` — لأنها data class نستخدمها مباشرة

**الإعدادات المطلوبة:**
```kotlin
// build.gradle.kts إضافات
testImplementation("io.mockk:mockk:1.13.8")
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.0")
```

**الاختبار:**
```kotlin
class ReaderViewModelTest {

    private val repository = mockk<KhatiraRepository>()
    private val testChapter = Chapter(
        id = "1",
        orderIndex = 1,
        title = "فصل اختبار",
        pages = listOf(
            Page(
                index = 0,
                titles = listOf("عنوان"),
                texts = listOf("نص"),
                order = listOf("titles", "texts")
            )
        )
    )

    @Before
    fun setup() {
        Dispatchers.setMain(StandardTestDispatcher())
        coEvery { repository.getChapter(any()) } returns testChapter
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `increaseFontSize increases by step when below max`() = runTest {
        val viewModel = ReaderViewModel(repository, "1")
        advanceUntilIdle()  // ← أنتظر init ليكتمل

        assertEquals(21f, viewModel.uiState.value.fontSize)

        viewModel.increaseFontSize()
        assertEquals(23f, viewModel.uiState.value.fontSize)

        viewModel.increaseFontSize()
        assertEquals(25f, viewModel.uiState.value.fontSize)
    }

    @Test
    fun `increaseFontSize does not exceed max`() = runTest {
        val viewModel = ReaderViewModel(repository, "1")
        advanceUntilIdle()

        // 21 → 37 (8 مرات)
        repeat(8) { viewModel.increaseFontSize() }
        assertEquals(37f, viewModel.uiState.value.fontSize)

        // لا يجب أن تتجاوز 37
        viewModel.increaseFontSize()
        assertEquals(37f, viewModel.uiState.value.fontSize)
    }

    @Test
    fun `decreaseFontSize does not go below min`() = runTest {
        val viewModel = ReaderViewModel(repository, "1")
        advanceUntilIdle()

        // 21f — لا يمكن أن تقل عن 21
        viewModel.decreaseFontSize()
        assertEquals(21f, viewModel.uiState.value.fontSize)
    }

    @Test
    fun `font size uses step of 2f`() = runTest {
        val viewModel = ReaderViewModel(repository, "1")
        advanceUntilIdle()

        viewModel.increaseFontSize()
        viewModel.increaseFontSize()
        assertEquals(25f, viewModel.uiState.value.fontSize)
        // 21 + 2 + 2 = 25 ✓
    }
}
```

**ماذا عن init؟:**
- `ReaderViewModel()` init يطلق `viewModelScope.launch { ... }`
- هذا الكوروتين يجب أن يكتمل قبل الاختبار ← `advanceUntilIdle()` أو `StandardTestDispatcher`
- `StandardTestDispatcher` لا ينفذ الكوروتينات تلقائياً — ينتظر `advanceUntilIdle()`

**ما الذي لا نختبره هنا:**
- لا نختبر الـ UI (لأن هذا unit test وليس ui test)
- لا نختبر Compose recomposition
- لا نختبر `HorizontalPager`

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف ماذا يحتاج إلى mock (repository فقط) | |
| يختبر حالات الحافة (min, max, step, حدود) | |
| يتعامل مع StandardTestDispatcher بشكل صحيح | |
| يستخدم MockK و runTest بشكل صحيح | |

---

### س24: R8 / ProGuard — لماذا هو مهم؟

**المرجع:** `app/build.gradle.kts:33-35`

```kotlin
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        optimization {
            enable = false  // ← R8 معطل
        }
    }
}
```

**السؤال:** ما هو R8؟ ماذا يفعل بالضبط (3 أشياء)؟ لماذا `optimization.enable = false` خطير للتطبيق الحقيقي؟ وما البيانات التي يتعرض لها المستخدم إذا كان R8 معطل؟

**الإجابة النموذجية:**

**ما هو R8؟**
R8 هو proguard shrinker + optimizer + obfuscator من Google. يُستخدم في تحويل الكود لـ release build.

**3 وظائف أساسية:**

1. **Shrinking (تصغير الحجم):**
   - يزيل الـ classes و methods و fields غير المستخدمة
   - يقلل حجم APK/DEX بشكل كبير
   - مثال: مكتبة Material Icons Extended كبيرة — بدون shrink نحمل 100% من الأيقونات

2. **Obfuscation (إبهام):**
   - يُعيد تسمية الـ classes و methods و fields إلى أسماء عشوائية (a, b, c ...)
   - يجعل الـ decompile صعباً جداً
   - بدون obfuscation: `com.islamux.khatir.data.repository.JsonKhatiraRepository` يظهر كما هو
   - مع obfuscation: `a.b.c.d` أو `x.y.z`

3. **Optimization (تحسين):**
   - يزيل الكود الميت
   - يدمج الـ classes المضمنة
   - يحسّن التعبيرات الشرطية غير المجدية
   - يحوّل الـ enum إلى int حيثما أمكن

**طريقة العمل:**
```
Kotlin/Java Source
    → Compiler → .class files
    → R8 (shrink + obfuscate + optimize)
    → DEX (Dalvik Executable)
    → APK
```

**لماذا `enable = false` خطير؟**

| بدون R8 | مع R8 |
|---------|-------|
| APK أكبر (يحتوي على مكتبات كاملة) | APK أصغر 30-60% |
| كل الـ class names مكشوفة | class names مثل a, b, c |
| كل الـ method names مكشوفة | method names مبهمة |
| كل الـ strings مكشوفة | strings مبهمة (مع مزيد من الإعدادات) |
| سهل الـ reverse engineering | صعب الـ reverse engineering |
| يجب الحفاظ على الـ debug info | لا debug info |

**بيانات مكشوفة عند تعطيل R8 (قابلة للقراءة من أي decompiler):**
- **API endpoints** (ليست موجودة هنا — offline app)
- **Database schema** (في التطبيقات التي تستخدم DB)
- **Hardcoded credentials** (موجودة بالفعل — مضاعفة الخطورة)
- **Business logic** — أي شخص يمكنه فهم كيف يعمل التطبيق
- **Analytics events** — أسماء الأحداث والـ parameters
- **Firebase keys** (إذا كانت موجودة)

**التصحيح:**
```kotlin
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        optimization {
            enable = true  // ← تفعيل R8
        }
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"  // ← استثناءات R8
        )
    }
}
```

**قاعدة مهمة:** R8 يزيل كل شيء غير مُشار إليه. إذا كنت تستخدم Reflection أو JNI أو مكتبة تتطلب class names معينة، يجب إضافتها إلى `proguard-rules.pro`:
```
-keep class com.islamux.khatir.data.model.** { *; }  // احتفظ بـ models (للتسلسل)
-keep class kotlinx.serialization.** { *; }        // احتفظ بـ serialization classes
```

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يعرف 3 وظائف لـ R8 (shrink, obfuscate, optimize) | |
| يشرح خطورة البيانات المكشوفة | |
| يعرف `proguard-rules.pro` ومتى يضيف استثناءات | |
| يقدّر توفير الحجم (30-60% بدون صور) | |

---

### س25: Android Security — Hardcoded Keys + ProGuard

**السؤال الشامل:** لديك مشكلتان أمنيتان في هذا المشروع: (1) keystore credentials في VCS وأعلامها مرور (2) R8 معطل. اشرح كيف يمكن لمهاجم استغلالهما معاً لانتحال هوية التطبيق. ما الـ 3 إجراءات التي تتخذها فوراً كـ senior developer؟

**الإجابة النموذجية:**

**سيناريو الهجوم:**

```
1. المهاجم ينسخ repository (public أو private مع access)
2. يجد:
   - storePassword = "salam123" في build.gradle.kts
   - keyPassword = "salam123"
   - keyAlias = "salam"
   - (قد يجد salam-release.jks أيضاً)
3. يبني تطبيقاً ضاراً
4. يوقّعه بنفس توقيعك
5. يوزعه باسمك:
   - على Google Play: تحديث ضار يحل محل تطبيقك (same signature = same developer)
   - على متجر آخر: تطبيق موقّع باسمك
   - APK مباشر: يمكن تثبيته فوق تطبيقك (same signature = upgrade path)
```

**ولأن R8 معطل:**
```
- المهاجم يستخدم decompiler (jadx, APKTool)
- يرى كل الكود بوضوح: JsonKhatiraRepository, AppModule, ViewModels
- يفهم كيف يعمل التطبيق بالكامل
- يبني نسخة معدلة بكل سهولة
```

**3 إجراءات فورية:**
```
1. تدوير المفاتيح (Key Rotation):
   - إنشاء keystore جديد بمفتاح جديد
   - توقيع APK جديد بالمفتاح الجديد
   - رفعه على Google Play
   - ملاحظة: هذا التطبيق الجديد سيكون له توقيع مختلف — لن يتمكن من تحديث التطبيق الحالي
   - Google Play يسمح بتغيير مفتاح التوقيع مرة واحدة باستخدام Play App Signing

2. إزالة السرّ من VCS:
   - إزالة salam-release.jks من git (git rm --cached)
   - إزالة كلمة المرور من build.gradle.kts (استخدام env variables)
   - إضافة keystore.properties إلى .gitignore
   - تطهير git history (BFG Repo-Cleaner)

3. لجميع المفاتيح المستقبلية:
   - التوقيع عبر Google Play App Signing
   - الاحتفاظ بالمفتاح الرئيسي بمعزل عن المطورين
   - استخدام CI/CD مع encrypted secrets
   - تفعيل R8 مع proguard-rules.pro
```

**Play App Signing (الحل الأمثل):**
```
Google يحتفظ بمفتاح التوقيع الرئيسي (App Signing Key)
أنت ترفع APK موقّعاً بـ Upload Key
يمكنك تغيير Upload Key في أي وقت عبر Google Play Console
مفتاحك الرئيسي محمي من السرقة
```

**التقييم:**

| المعيار | 0-5 |
|---------|-----|
| يبني سيناريو هجوم واقعياً | |
| يأخذ 3 إجراءات فورية محددة | |
| يعرف Play App Signing | |
| يقدّر خطورة الجمع بين المشكلتين | |

---

## التقيم النهائي

### سلم التقييم

| الجولة | الموضوع | مجموعك | من |
|--------|---------|--------|----|
| 1 | أساسيات Kotlin & Android | | /25 |
| 2 | قرارات معمارية | | /25 |
| 3 | تتبع التدفق | | /20 |
| 4 | اكتشف المشاكل | | /25 |
| 5 | نظرية عامة | | /25 |
| **الإجمالي** | | | **/120** |

### معنى النتيجة

| النتيجة | المعنى |
|---------|--------|
| 100-120 | **فهم عميق جداً** — أنت Senior. تفهم كل قرار في الكود، وتستطيع نقد نفسك وتحسين المشروع. |
| 75-99 | **فهم جيد** — أنت Mid-Level مع خبرة قوية. تعرف الأساسيات، وتخطئ في القرارات المعمارية أو الـ performance. |
| 50-74 | **فهم سطحي** — Junior متقدم. تفهم الكود وتستطيع تعديله، ولكن لا ترى الـ trade-offs أو الـ anti-pattern. |
| 25-49 | **تحتاج مراجعة** — مبتدئ. تفهم معظم الكود على السطر ولكن لا تفهم "لماذا". |
| 0-24 | **Copy-Paste** — لا تفهم الكود الذي كتبته. النقاط الحمراء ستكون معظم إجاباتك. |

### علامات الخطر الحمراء (Red Flags)

كل נקرة حمراء = أنت لا تفهم هذا الجزء من الكود فعلاً:

| # | العلامة الحمراء | تظهر في سؤال |
|---|----------------|-------------|
| ❌ | "StateFlow أفضل دائماً من LiveData" | س1 |
| ❌ | استخدام `!!` بدون فهم المخاطر | س2 |
| ❌ | أخذ `7f` و `21f` والأرقام مرور الكرام | س3 |
| ❌ | "GlobalScope لا بأس به في ViewModel" | س4 |
| ❌ | عدم معرفة أن `object` lazy + thread-safe | س5 |
| ❌ | "Manual DI دائماً أفضل" | س6 |
| ❌ | "order" هو مجرد ترتيب — وليس فلسفة تصميم | س7 |
| ❌ | `@SerialName` يستخدم في اتجاه واحد فقط | س8 |
| ❌ | عدم ذكر stale data في caching | س9 |
| ❌ | تبرير JSON بدون فهم المشكلة (أوفلاين، تحديثات) | س10 |
| ❌ | عدم ذكر `key = chapterId` في ViewModel | س11 |
| ❌ | عدم فهم أن `key()` يُزيل ويعيد إنشاء composable | س12 |
| ❌ | عدم اقتراح debounce في البحث | س13 |
| ❌ | نسيان `initialPage` في مسار الراوت | س14 |
| ❌ | "exitProcess = finish" | س15 |
| ❌ | "سأخفيها في gitignore فقط" (لازم تنظف التاريخ) | س16 |
| ❌ | "الـ JSON لن يتلف — لا مشكلة في silent catch" | س17 |
| ❌ | عدم معرفة أن كل ضغطة تولد 2600+ كائن String | س18 |
| ❌ | عدم معرفة أحدث API level (36) | س19 |
| ❌ | عدم معرفة الفرق بين ViewModel و onSaveInstanceState | س20 |
| ❌ | استخدام System.gc() كحل للمشاكل | س21 |
| ❌ | عدم اكتشاف انتهاك OCP في fieldLabel() | س22 |
| ❌ | عدم كتابة test لحالات الحافة (min, max, edge) | س23 |
| ❌ | "R8 مجرد تحسين حجم — ليس ضرورياً" | س24 |
| ❌ | عدم بناء سيناريو هجوم متكامل | س25 |

### الخلاصة

كل سؤال في هذه المقابلة صُمم خصيصاً بناءً على كودك الفعلي. إذا كنت تستحق الدرجة التي تعتقدها، فستعرف إجابات معظم الأسئلة دون مساعدة.

**النصيحة الأخيرة:** لا تحفظ الإجابات. كل سؤال يختبر "لماذا" وليس "ماذا". إذا فهمت الكود حقاً، ستتمكن من شرح كل سطر في مشروعك وكيفية تحسينه.
