# DentTrack - Analysis & Improvement Plan

## Current State (Web MVP)
- **Stack:** React 19 + TypeScript + Vite
- **Features:**
  - Interactive tooth map (32 teeth, FDI notation)
  - Treatment logging with types (filling, crown, root canal, etc.)
  - Timeline view
  - User profile
  - Mock Supabase auth
- **Missing:** Real database, actual auth, data persistence

## Immediate Fixes Needed
- [ ] Add real Supabase integration (replace mock)
- [ ] Add data persistence (localStorage as fallback)
- [ ] Fix Tailwind - currently using class names but Tailwind not properly configured
- [ ] Add PWA manifest for mobile install
- [ ] Add export/import data feature

## iOS Conversion Plan

### Phase 1: Core App (SwiftUI)
- [ ] Project setup with SwiftUI
- [ ] ToothMapView - circular layout like web version
- [ ] Tooth model with FDI notation
- [ ] Treatment model
- [ ] Local storage with SwiftData/CoreData

### Phase 2: Features
- [ ] Treatment form modal
- [ ] Timeline view
- [ ] Tooth detail view
- [ ] Photo attachments (X-rays)
- [ ] iCloud sync

### Phase 3: Premium
- [ ] Reminders for checkups
- [ ] Cost tracking & analytics
- [ ] PDF export for dentist
- [ ] Family accounts
- [ ] AI analysis of X-rays (future)

## Feature Ideas
1. **Smart Reminders** - "Time for your 6-month checkup"
2. **Cost Tracker** - Track dental expenses, insurance
3. **Dentist Sharing** - Generate PDF report for dentist
4. **Photo Timeline** - Before/after photos of procedures
5. **Pain Diary** - Log tooth pain with location
6. **Insurance Integration** - Track coverage/claims

## Monetization
- Free: Basic tracking, 1 profile
- Pro ($4.99/mo): Unlimited history, family, exports, reminders
- Lifetime: $29.99

## Competition Analysis
- Dental Record apps exist but most are outdated/ugly
- Opportunity: Modern UI + smart features + family support
