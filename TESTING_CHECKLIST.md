# DentTrack Testing Checklist

## 🚀 Quick Start
```bash
cd /home/molt/clawd/projects/dent-track
npm run dev
```
Then open http://localhost:3000

---

## ✅ Features to Test

### 1. Language Switching 🌍
- [ ] Go to **Account** (bottom nav)
- [ ] Find **Settings** section
- [ ] Click **Language** dropdown
- [ ] Switch between **English** and **Українська**
- [ ] Verify all UI text changes instantly
- [ ] Check navigation labels update (Home, Journal, Account)
- [ ] Check modal titles are translated

**Expected:** All text should switch between languages seamlessly

---

### 2. Theme Toggle 🎨
- [ ] Go to **Account** → **Settings**
- [ ] Find **Theme** dropdown
- [ ] Try **Light** mode
  - Should see light background, dark text
- [ ] Try **Dark** mode
  - Should see dark background (#0f172a), light text
- [ ] Try **Auto** mode
  - Should match your system theme preference
- [ ] Refresh the page
  - Theme should persist (saved in localStorage)

**Expected:** Smooth transitions, colors should look good in both modes

---

### 3. PDF Export 📤
**Test Export for Dentist:**
- [ ] Go to **Account** → **Export** section
- [ ] Click **Export for Dentist** button
- [ ] PDF should download automatically
- [ ] Open the PDF and verify:
  - [ ] Patient info is included
  - [ ] Tooth map summary is present
  - [ ] Treatment history table exists
  - [ ] Dentist column shows only **clinic names** (NO phone numbers)
  - [ ] File naming: `denttrack-for-dentist-YYYY-MM-DD.pdf`

**Test Personal Export:**
- [ ] Click **Personal Export** button
- [ ] PDF should download
- [ ] Open the PDF and verify:
  - [ ] All patient info included
  - [ ] Treatment history with full dentist details
  - [ ] Dentist section at bottom with **all contact info** (phone, clinic, notes)
  - [ ] File naming: `denttrack-personal-YYYY-MM-DD.pdf`

**Test Multi-language Export:**
- [ ] Switch language to **Українська**
- [ ] Export PDF again
- [ ] Verify PDF labels are in Ukrainian (Пацієнт, Дата, etc.)

**Expected:** PDFs download with proper formatting, correct data privacy modes

---

### 4. Supabase Cloud Sync ☁️
- [ ] Go to **Account**
- [ ] Find **Cloud Sync** card
- [ ] Click **Sign In** button
- [ ] Google OAuth popup should appear
- [ ] Sign in with Google account
- [ ] After auth:
  - [ ] Green cloud icon appears in header
  - [ ] Email is displayed in sync card
  - [ ] Status shows "Synced"
- [ ] Add a treatment or dentist
- [ ] Refresh the page
- [ ] Data should persist (loaded from Supabase)

**Test Offline Mode:**
- [ ] Sign out
- [ ] Add a treatment
- [ ] Data should save to localStorage
- [ ] Refresh page - data should still be there

**Expected:** Seamless sync when logged in, localStorage fallback when offline

---

## 🎨 Visual Quality Checks

### Dark Mode Specific:
- [ ] All text is readable
- [ ] Buttons have proper contrast
- [ ] Cards have visible borders
- [ ] No "flash" of light mode on page load
- [ ] Scrollbars match theme

### Mobile Responsiveness:
- [ ] Test on mobile screen (resize browser)
- [ ] Bottom navigation stays fixed
- [ ] Modals slide up from bottom on mobile
- [ ] Text is readable (not too small)

---

## 🐛 Known Limitations

1. **First Export Test**: If you haven't added any treatments/dentists yet, PDF will have "No treatments recorded" - this is expected
2. **Google OAuth**: Requires Supabase Google provider to be configured in dashboard
3. **Theme Flash**: On very first load, there might be a brief flash before theme applies (acceptable for MVP)

---

## 📊 Success Criteria

All features should work:
- ✅ Language switches work instantly
- ✅ Theme persists across refreshes
- ✅ PDF exports download successfully
- ✅ PDFs show correct privacy mode (dentist vs personal)
- ✅ Multi-language PDFs work
- ✅ Supabase auth works (if configured)
- ✅ Data syncs to cloud when logged in
- ✅ Offline mode works with localStorage

---

## 🚨 If Something Doesn't Work

1. **Check browser console** (F12) for errors
2. **Verify .env.local exists** with Supabase credentials
3. **Restart dev server**: Ctrl+C, then `npm run dev`
4. **Check Supabase dashboard** for auth provider setup

---

## 📸 Screenshots to Take (Optional)

1. Profile view showing Settings (language/theme selectors)
2. Profile view showing Export buttons
3. Sample PDF output (both modes)
4. Dark mode screenshot
5. Ukrainian language screenshot

---

**Happy Testing! 🎉**

All features were implemented and tested for build errors. Functional testing is now in your hands!
