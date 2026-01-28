# DentTrack Project Context

This document captures the development history and decisions made during the DentTrack app development.

## Project Overview

**DentTrack** is a Progressive Web App (PWA) for dental patient record tracking, primarily targeting iOS. It allows users to visualize their dental health using an interactive tooth map, log dental treatments, view a treatment timeline with calendar, and manage dentist contacts.

## Tech Stack

- **React 19.2** with TypeScript 5.8
- **Vite 6.2** for bundling and dev server
- **Tailwind CSS** (CDN-based) with custom dental color palette
- **Lucide React** for icons
- **PWA** with manifest.json for iOS standalone app installation

---

## Development Sessions

### Session 1: Initial Setup & White Screen Fix

**Problem**: App showed white/blank screen on load.

**Root Cause**:
1. Missing `<script type="module" src="/index.tsx"></script>` in index.html
2. Conflicting import map trying to load React from CDN instead of Vite bundler

**Fix Applied**:
```html
<!-- Removed conflicting import map -->
<!-- Added entry point script -->
<script type="module" src="/index.tsx"></script>
```

### Session 2: iOS Development Setup

**User Goal**: Debug and test on iOS devices

**Setup Instructions Provided**:
1. Run `npm install` to install dependencies
2. Run `npm run dev -- --host` to expose server to network
3. Use Network URL (e.g., `http://192.168.x.x:3000`) in iOS Simulator Safari
4. Enable Safari Web Inspector for debugging (Settings → Safari → Advanced → Web Inspector)
5. Use `ngrok http 3000` for HTTPS when testing PWA install features

**Deployment**: Vercel recommended for production PWA hosting

### Session 3: Tooth Map Improvements

**Issues Fixed**:
1. Teeth were overlapping
2. Tooth shapes were inconsistent sizes
3. Numbers were mispositioned

**Changes Made** (`components/ToothMap.tsx`):
- All teeth now use identical rounded rectangle shape (24x36px)
- Teeth positioned at 11° intervals around oval arc
- 11/21 centered at top (270°), 31/41 centered at bottom (90°)
- Upper and lower jaws use same radius (140x120) for equal width
- Labels positioned outside the arc

### Session 4: Add Dentist Feature

**New Data Models** (`types.ts`):
```typescript
export enum DentistType {
  GENERAL = 'General Dentist',
  SURGEON = 'Oral Surgeon',
  ENDODONTIST = 'Endodontist',
  ORTHODONTIST = 'Orthodontist',
  PERIODONTIST = 'Periodontist',
  PEDIATRIC = 'Pediatric Dentist',
  PROSTHODONTIST = 'Prosthodontist',
  OTHER = 'Other'
}

export interface Dentist {
  id: string;
  name: string;           // Required
  clinicName?: string;
  type?: DentistType;
  phone?: string;
  notes?: string;
  isVerified: boolean;    // For future verified dentist matching
}
```

**Treatment Updated**:
- Added `dentistId?: string` field to link treatments to dentists

**New Components**:
- `DentistForm.tsx` - Form to add new dentist

**UI Updates**:
- Profile/Account view now shows menu options:
  - "Add Dentist" button
  - "My Dentists" section with saved dentist cards
- Treatment form includes dentist dropdown with "+" button to add new

### Session 5: Calendar View & Journal Enhancements

**New Component**: `CalendarView.tsx`

**Features**:
- Monthly calendar grid with prev/next navigation
- "Today" quick jump button
- Treatment days highlighted with colored dots by type:
  - Filling → Blue
  - Root Canal → Red
  - Crown → Yellow
  - Extraction → Gray
  - Veneer → Purple
  - Implant → Dark Gray
  - Braces/Mouthguard → Pink
  - Hygiene → Green
  - Checkup → Teal
  - Other → Orange
- Click date to see treatments for that day
- Legend at bottom

**Monthly Stats** (below calendar):
- Number of procedures
- Number of unique visit days
- Total money spent (grouped by currency)

**Journal View Toggle**:
- Calendar icon / List icon toggle in header
- Calendar view is default

### Session 6: Treatment Editing & Tooth Selection

**Treatment Form Improvements** (`TreatmentForm.tsx`):

1. **Tooth Number Field**:
   - Dropdown with all 32 teeth grouped by quadrant
   - Pre-selects tooth if one was clicked on map
   - Can select "General (no specific tooth)" for procedures like hygiene

2. **Edit Mode**:
   - Form accepts `editingTreatment` prop
   - Pre-fills all fields when editing
   - Shows "Edit Procedure" title and "Update Record" button
   - Preserves existing attachments

**Editing Workflows**:
- **Calendar View**: Click date → tap treatment → opens edit form
- **List View**: Click pencil icon on treatment card → opens edit form

**New Treatment Type Added**:
- `BRACES = 'Braces/Mouthguard'`

---

## File Structure

```
dent-track/
├── index.html              # Entry HTML with Tailwind CDN
├── index.tsx               # React entry point
├── App.tsx                 # Main app component, state management
├── types.ts                # TypeScript interfaces and enums
├── constants.ts            # Initial teeth data (FDI notation)
├── components/
│   ├── ToothMap.tsx        # Interactive tooth visualization
│   ├── TreatmentForm.tsx   # Add/edit treatment form
│   ├── Timeline.tsx        # List view of treatments
│   ├── CalendarView.tsx    # Calendar view with stats
│   └── DentistForm.tsx     # Add dentist form
├── services/
│   └── geminiService.ts    # Placeholder for AI features
├── lib/
│   └── supabase.ts         # Mock Supabase client
├── figma-assets/           # SVG assets for Figma import
│   ├── tooth-map.svg
│   └── status-overlays.svg
├── CLAUDE.md               # AI assistant instructions
├── PROJECT_CONTEXT.md      # This file - development history
├── manifest.json           # PWA manifest
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Data Models Summary

### Tooth Status
- HEALTHY, FILLED, TREATED (Root Canal), CROWN, VENEER, MISSING, IMPLANT, ATTENTION

### Treatment Types
- FILLING, ROOT_CANAL, CROWN, EXTRACTION, VENEER, IMPLANT, BRACES, HYGIENE, CHECKUP, OTHER

### FDI Tooth Numbering
- Upper Right: 18-11
- Upper Left: 21-28
- Lower Left: 31-38
- Lower Right: 41-48

---

## Pending/Future Features

1. **Data Persistence**: Currently no localStorage/database - data lost on refresh
2. **Real Supabase Integration**: Auth and cloud sync
3. **Gemini AI Integration**: Placeholder exists
4. **Verified Dentist Matching**: `isVerified` field ready for future use
5. **Favorite Dentist Stats**: "Your fav dentist this month" insight
6. **Native iOS Design Improvements**: iOS-style blur effects, SF Pro typography

---

## Commands Reference

```bash
# Install dependencies
npm install

# Start dev server (local only)
npm run dev

# Start dev server (network accessible for iOS testing)
npm run dev -- --host

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Design Decisions

1. **Mobile-first**: PWA with iOS safe area support, touch-optimized UI
2. **No validation on dentist form**: Intentionally simple for MVP
3. **Treatment updates tooth status**: e.g., Extraction → MISSING
4. **Calendar as default journal view**: More visual, shows patterns
5. **Edit in place**: No separate edit screen, reuses treatment form
