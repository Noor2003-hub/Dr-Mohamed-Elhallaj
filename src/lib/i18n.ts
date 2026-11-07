/**
 * Site languages and the fixed interface text (buttons, labels, alt text).
 * Content the doctor edits lives in Payload, which has its own en/ar versions.
 */
export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v)
export const dirOf = (l: Locale) => (l === 'ar' ? 'rtl' : 'ltr')
/** Home page path for each language: English stays on "/". */
export const homePath = (l: Locale) => (l === DEFAULT_LOCALE ? '/' : `/${l}`)

const en = {
  meta: {
    title: 'Dr. Mohamed Elhallaj · Physical therapy and sports injuries',
    description:
      'Doctor of physical therapy, orthopedic diseases and sports injuries specialist. Co-founder of Experts Physio House.',
  },
  nav: {
    main: 'Main',
    backToTop: 'Back to top',
    brand: 'Dr. Elhallaj',
    about: 'About',
    treat: 'What I treat',
    reels: 'Reels',
    experience: 'Experience',
    clinics: 'Clinics',
    book: 'Book on WhatsApp',
    language: 'Language',
    switchTo: 'العربية',
    switchLabel: 'اقرأ الموقع بالعربية',
  },
  story: {
    label: 'Introduction',
    book: 'Book an assessment',
    watch: 'Watch his reels',
    hint: 'Scroll to meet the doctor',
  },
  body: {
    back: 'Patient seen from the back',
    front: 'Patient seen from the front',
    kidsPhoto: 'A child patient seen from the back',
    selected: 'Selected area',
    inProgress: ' (in progress)',
    patient: 'Patient',
    adults: 'Adults',
    children: 'Children',
    kids: 'Whole-body pediatric rehab',
  },
  tools: { eyebrow: 'Tools in the clinic' },
  reels: {
    filter: 'Filter reels',
    all: 'All',
    prev: 'Previous reels',
    next: 'Next reels',
    views: 'views',
    more: 'More on Instagram',
  },
  track: {
    label: 'Experience',
    logo: 'Logo',
    walk: 'The patient’s recovery: pushed in a wheelchair by the doctor, then two crutches, one crutch, walking on his own, running, and kicking a football',
  },
  edu: { diplomas: 'Diplomas', inProgress: '● In progress', further: 'Further training' },
  clinics: {
    followClinic: 'Follow the clinic on Instagram →',
    map: 'Map of eastern Alexandria with both branches',
    sea: 'Mediterranean Sea',
    directions: 'Get directions →',
  },
  contact: { whatsapp: 'Message on WhatsApp', email: 'Send an email' },
  footer: { explore: 'Explore', follow: 'Follow', instagram: 'Instagram', youtube: 'YouTube', top: 'Back to top ↑' },
}

export type Dict = typeof en

const ar: Dict = {
  meta: {
    title: 'د. محمد الحلاج · العلاج الطبيعي وإصابات الملاعب',
    description:
      'دكتور العلاج الطبيعي، أخصائي أمراض العظام وإصابات الملاعب، والشريك المؤسس لمركز الخبراء للعلاج الطبيعي.',
  },
  nav: {
    main: 'القائمة الرئيسية',
    backToTop: 'العودة للأعلى',
    brand: 'د. الحلاج',
    about: 'من هو',
    treat: 'ماذا أعالج',
    reels: 'الريلز',
    experience: 'الخبرة',
    clinics: 'العيادات',
    book: 'احجز عبر واتساب',
    language: 'اللغة',
    switchTo: 'English',
    switchLabel: 'Read the site in English',
  },
  story: {
    label: 'المقدمة',
    book: 'احجز جلسة تقييم',
    watch: 'شاهد الريلز',
    hint: 'مرّر لتتعرّف على الدكتور',
  },
  body: {
    back: 'المريض من الخلف',
    front: 'المريض من الأمام',
    kidsPhoto: 'طفل من الخلف',
    selected: 'المنطقة المختارة',
    inProgress: ' (قيد الدراسة)',
    patient: 'المريض',
    adults: 'الكبار',
    children: 'الأطفال',
    kids: 'تأهيل الأطفال للجسم كله',
  },
  tools: { eyebrow: 'الأدوات في العيادة' },
  reels: {
    filter: 'تصفية الريلز',
    all: 'الكل',
    prev: 'الريلز السابقة',
    next: 'الريلز التالية',
    views: 'مشاهدة',
    more: 'المزيد على إنستجرام',
  },
  track: {
    label: 'الخبرة',
    logo: 'الشعار',
    walk: 'رحلة تعافي المريض: الدكتور يدفعه على كرسي متحرك، ثم عكازان، ثم عكاز واحد، ثم يمشي وحده، ثم يركض ويسدد كرة القدم',
  },
  edu: { diplomas: 'الدبلومات', inProgress: '● قيد الدراسة', further: 'تدريب إضافي' },
  clinics: {
    followClinic: 'تابع المركز على إنستجرام ←',
    map: 'خريطة شرق الإسكندرية بالفرعين',
    sea: 'البحر المتوسط',
    directions: 'احصل على الاتجاهات ←',
  },
  contact: { whatsapp: 'راسلنا على واتساب', email: 'أرسل بريدًا إلكترونيًا' },
  footer: { explore: 'تصفّح', follow: 'تابعنا', instagram: 'إنستجرام', youtube: 'يوتيوب', top: 'العودة للأعلى ↑' },
}

const DICTS: Record<Locale, Dict> = { en, ar }
export const getDict = (l: Locale) => DICTS[l]
