# DentTrack Implementation Plan
**Created:** 2026-01-30  
**Status:** Ready to implement

## 📋 Summary of Changes

### ✅ Completed
1. **Ukrainian localization** - High quality translation files created (`i18n/uk.json`, `i18n/en.json`)
2. **Database migrations** - Ready to execute in Supabase
3. **Architecture design** - Image hosting & storage strategy defined

### 🚧 To Implement
1. Dark/Light theme toggle
2. i18n integration in React components
3. Export functionality (with/without dentist contacts)
4. Image upload UI for X-rays

---

## 🗄️ Database Migrations

### Execute in Supabase SQL Editor (in order):

**Migration 1:** `supabase/migrations/20260130_add_xray_storage.sql`
- Creates `xrays` storage bucket
- Adds RLS policies for user-only access
- Adds `attachments` column to treatments (for X-ray image paths)
- Adds `ct_scan_links` column (for external CT/DICOM URLs)

**Migration 2:** `supabase/migrations/20260130_add_user_preferences.sql`
- Creates `user_preferences` table (theme, language)
- RLS policies
- Auto-update `updated_at` trigger

### How to Execute:
1. Go to Supabase Dashboard → SQL Editor
2. Paste migration 1 → Run
3. Paste migration 2 → Run
4. Verify in Table Editor

---

## 🎨 Theme Implementation

### Option A: Simple CSS Variables (Recommended for MVP)

```typescript
// Add to App.tsx state
const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

// Add theme effect
useEffect(() => {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'auto' && systemDark);
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}, [theme]);
```

**Add to `index.html` `<style>` block:**
```css
/* Dark mode variables */
:root.dark {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-text: #f1f5f9;
  --color-text-secondary: #cbd5e1;
}

/* Update Tailwind classes to use CSS variables */
.dark .bg-white { background-color: var(--color-surface) !important; }
.dark .text-slate-900 { color: var(--color-text) !important; }
.dark .text-slate-500 { color: var(--color-text-secondary) !important; }
.dark .border-slate-200 { border-color: var(--color-border) !important; }
```

**Add theme toggle to Profile view:**
```tsx
<div className="bg-white dark:bg-slate-800 rounded-2xl p-4">
  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
    {t('profile.theme')}
  </label>
  <select
    value={theme}
    onChange={(e) => setTheme(e.target.value as any)}
    className="w-full mt-2 p-3 border rounded-xl"
  >
    <option value="light">{t('profile.themeLight')}</option>
    <option value="dark">{t('profile.themeDark')}</option>
    <option value="auto">{t('profile.themeAuto')}</option>
  </select>
</div>
```

---

## 🌍 i18n Integration

### 1. Install i18next:
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 2. Create `lib/i18n.ts`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../i18n/en.json';
import uk from '../i18n/uk.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 3. Import in `index.tsx`:
```typescript
import './lib/i18n';
```

### 4. Use in components:
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button onClick={() => i18n.changeLanguage('uk')}>
        Українська
      </button>
    </div>
  );
}
```

### 5. Language toggle in Profile:
```tsx
<select
  value={i18n.language}
  onChange={(e) => i18n.changeLanguage(e.target.value)}
  className="w-full p-3 border rounded-xl"
>
  <option value="en">English</option>
  <option value="uk">Українська</option>
</select>
```

---

## 📤 Export Implementation

### Two export modes:

**1. For Dentist** (without personal dentist contacts):
- Patient name, DOB, blood type, allergies
- Tooth map with statuses
- Treatment history (date, tooth, type, cost)
- **Dentist field shows only clinic name** (no phone/personal info)

**2. Personal Export** (full data):
- Everything above
- Full dentist contacts (name, phone, clinic, notes)
- All metadata

### Implementation approach:

```typescript
function exportToPDF(mode: 'dentist' | 'personal') {
  const treatmentsToExport = treatments.map(t => {
    if (mode === 'dentist') {
      const dentist = dentists.find(d => d.id === t.dentistId);
      return {
        ...t,
        dentistName: dentist?.clinicName || 'N/A', // Only clinic name
      };
    } else {
      const dentist = dentists.find(d => d.id === t.dentistId);
      return {
        ...t,
        dentistFull: dentist, // Full dentist object
      };
    }
  });
  
  // Generate PDF with filtered data
  generatePDF(treatmentsToExport, userProfile, teeth, mode);
}
```

### Library recommendation:
```bash
npm install jspdf jspdf-autotable
```

**Add export buttons in Profile view:**
```tsx
<div className="space-y-3">
  <button
    onClick={() => exportToPDF('dentist')}
    className="w-full bg-dental-600 text-white p-4 rounded-xl font-bold"
  >
    {t('profile.exportForDentist')}
  </button>
  <button
    onClick={() => exportToPDF('personal')}
    className="w-full bg-slate-600 text-white p-4 rounded-xl font-bold"
  >
    {t('profile.exportPersonal')}
  </button>
</div>
```

---

## 📸 X-ray Upload Implementation

### 1. Add image picker to TreatmentForm:

```tsx
const [attachments, setAttachments] = useState<File[]>([]);

<div className="space-y-2">
  <label className="text-sm font-bold">X-rays / Photos</label>
  <input
    type="file"
    accept="image/*"
    multiple
    capture="environment"
    onChange={(e) => setAttachments(Array.from(e.target.files || []))}
    className="w-full"
  />
  {attachments.map((file, i) => (
    <div key={i} className="flex items-center gap-2">
      <img 
        src={URL.createObjectURL(file)} 
        className="w-16 h-16 object-cover rounded" 
      />
      <span className="text-sm">{file.name}</span>
    </div>
  ))}
</div>
```

### 2. Upload to Supabase Storage on save:

```typescript
async function uploadXrays(userId: string, files: File[]): Promise<string[]> {
  const paths: string[] = [];
  
  for (const file of files) {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('xrays')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (!error && data) {
      paths.push(data.path);
    }
  }
  
  return paths;
}

// When saving treatment:
const xrayPaths = await uploadXrays(user.id, attachments);
await saveTreatment({
  ...treatmentData,
  attachments: xrayPaths,
});
```

### 3. Display X-rays in treatment detail:

```tsx
{treatment.attachments?.map((path, i) => {
  const { data } = supabase.storage.from('xrays').getPublicUrl(path);
  return (
    <img 
      key={i}
      src={data.publicUrl} 
      className="w-full rounded-xl"
      alt={`X-ray ${i + 1}`}
    />
  );
})}
```

---

## 🔗 CT Scan Links Implementation

### Add to TreatmentForm:

```tsx
const [ctLinks, setCtLinks] = useState<Array<{
  url: string;
  description: string;
  expiry_date: string;
}>>([]);

<div className="space-y-2">
  <label className="text-sm font-bold">CT Scan Links</label>
  <button 
    onClick={() => setCtLinks([...ctLinks, { url: '', description: '', expiry_date: '' }])}
    className="text-sm text-dental-600"
  >
    + Add CT Link
  </button>
  {ctLinks.map((link, i) => (
    <div key={i} className="border p-3 rounded-xl space-y-2">
      <input
        type="url"
        placeholder="https://dentist-portal.com/scan/..."
        value={link.url}
        onChange={(e) => {
          const updated = [...ctLinks];
          updated[i].url = e.target.value;
          setCtLinks(updated);
        }}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="КТ верхньої щелепи"
        value={link.description}
        onChange={(e) => {
          const updated = [...ctLinks];
          updated[i].description = e.target.value;
          setCtLinks(updated);
        }}
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={link.expiry_date}
        onChange={(e) => {
          const updated = [...ctLinks];
          updated[i].expiry_date = e.target.value;
          setCtLinks(updated);
        }}
        className="w-full p-2 border rounded"
      />
    </div>
  ))}
</div>

// Save with treatment:
await saveTreatment({
  ...treatmentData,
  ct_scan_links: ctLinks,
});
```

---

## 💰 Cost Analysis

### Supabase Storage Pricing (First Option):
- **Free tier:** 1 GB storage
- **Pro:** $0.021/GB/month after 1GB
- **Bandwidth:** Free for first 50GB/month
- **Estimate for 1000 users:**
  - Average 10 X-rays/user × 500KB = 5MB/user
  - Total: ~5GB storage
  - Cost: **~$0.10/month**

### If scaling to 100k+ users:
- **Cloudflare R2:**
  - $0.015/GB storage
  - **Zero egress fees** (huge savings)
  - 100k users × 5MB = 500GB
  - Cost: **$7.50/month** (vs $84/month on AWS S3)

**Recommendation:** Start with Supabase Storage, migrate to R2 when you hit 10k+ users.

---

## 🚀 Implementation Priority

1. **Execute migrations** ← Do this first
2. **Theme toggle** (2-3 hours) ← Immediate user value
3. **Ukrainian localization** (1-2 days) ← Key for UA market
4. **Export functionality** (3-4 hours) ← Important for sharing with dentists
5. **X-ray upload** (4-5 hours) ← Nice to have, not critical for MVP

---

## 📝 Notes

- **Don't overdo storage buckets** - One `xrays` bucket is enough for all image types
- **Image compression** - Consider using Supabase image transformation (resize on-the-fly)
- **Lazy loading** - Only load X-ray images when user opens treatment detail
- **CT links** - Store as JSON array, no separate table needed

---

## ✅ Checklist Before Launch

- [ ] Migrations executed in Supabase
- [ ] Theme toggle working (persisted to user_preferences)
- [ ] Language toggle working (persisted)
- [ ] Export for dentist tested (no personal contacts visible)
- [ ] Export personal tested (full data included)
- [ ] X-ray upload tested on real iPhone
- [ ] Storage policies verified (users can't access others' images)
- [ ] Test with Doppler secrets loaded (`dental-passport/prd`)

---

**Questions?** Let me know what to implement first! 🚀
