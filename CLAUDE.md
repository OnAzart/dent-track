# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DentTrack is a Progressive Web App (PWA) for dental patient record tracking. It allows users to visualize their dental health using an interactive tooth map, log dental treatments, view a treatment timeline, and manage user profiles. The app integrates with Google authentication for cloud synchronization via Supabase.

## Build and Development Commands

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev` (runs on `http://localhost:3000`)
- **Build for production**: `npm run build`
- **Preview production build locally**: `npm run preview`

### Environment Setup

Create a `.env.local` file in the root with:
```
GEMINI_API_KEY=your_key_here
```

This is used for AI features (currently integrated via `@google/genai`).

## Architecture Overview

### Technology Stack

- **React 19.2** with TypeScript 5.8
- **Vite 6.2** for bundling and dev server
- **Tailwind CSS** (CDN-based in index.html) with custom dental color palette
- **Lucide React** for icons
- **Supabase** mock client (ready for real integration)
- **PWA** with manifest.json for standalone app installation

### Core Data Models

See `types.ts` for the complete definitions. Key types:

- **Tooth**: FDI notation numbers (11-48), status enums (healthy, filled, crown, etc.)
- **Treatment**: Dental procedures linked to teeth or general (null toothId), includes type, date, notes, cost, and attachments
- **UserProfile**: Patient metadata (name, DOB, blood type, allergies, medical notes)
- **ToothStatus & TreatmentType**: Enums defining the treatment/status taxonomy

### Component Structure

```
App.tsx                    # Main container, state management, routing (map/timeline/profile views)
├── ToothMap.tsx          # Interactive tooth grid visualization
├── TreatmentForm.tsx     # Modal form for recording new procedures
├── Timeline.tsx          # Chronological treatment history view
constants.ts             # INITIAL_TEETH (32 teeth in FDI notation), STATUS_COLORS map
types.ts                 # TypeScript interfaces and enums
services/
  └── geminiService.ts    # Placeholder for Gemini API integration
lib/
  └── supabase.ts         # Mock Supabase client (awaiting real config)
```

### App Flow

1. **Authentication**: Mock Google OAuth integration via Supabase (currently bypassed for development)
2. **Main View**: Three-tab interface (bottom navigation):
   - **Map**: Interactive tooth grid showing current dental status; quick action to record treatment
   - **Timeline**: Chronological journal of all treatments with tooth references
   - **Profile/Account**: User profile management and cloud sync status
3. **Treatment Recording**: Modal form triggered from map view; updates both tooth status and treatment history
4. **State Management**: Local React state with no persistence layer (mock Supabase ready to replace)

### UI/UX Notes

- **Mobile-first design** with PWA capabilities (safe-area-inset for notch support, viewport-fit=cover)
- **Tailwind theming**: Custom `dental-*` color palette (blue-based)
- **Icons**: Lucide icons throughout (Settings, Calendar, Activity, etc.)
- **Responsive**: Works on mobile and desktop with modal adjustments for larger screens
- **Animations**: Fade-in transitions for view changes

### Key Integration Points

1. **Supabase Integration** (`lib/supabase.ts`):
   - Currently mocked; replace with real Supabase client initialization
   - Ready for auth, user profiles, and treatment data sync

2. **Gemini AI** (`services/geminiService.ts`):
   - File is nearly empty; intended for future AI-powered features
   - API key configured in vite.config.ts via `process.env.GEMINI_API_KEY`

3. **Tooth Status Mapping** (`App.tsx:76-86`):
   - Treatment type determines tooth status update (e.g., Extraction → MISSING)
   - Extend this logic when adding new treatment types

### Development Notes

- **FDI Notation**: Teeth numbered 11-48 (quadrant-position system). Layout in constants.ts comments explains the mapping
- **Treatment ID Generation**: Currently random strings (`Math.random().toString(36)`); replace with database IDs on backend integration
- **No tests**: Currently untested; consider adding Vitest/Jest as features stabilize
- **Styling**: Inline Tailwind via className; no CSS modules or separate stylesheet
- **PWA Features**: Manifest and meta tags configured for iOS standalone mode and web installation
