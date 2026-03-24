# MediToken

## Current State
Full-stack hospital appointment booking app with patient and doctor portals. Frontend uses React/TypeScript with localStorage-based state (seed data for hospitals/doctors). Backend is a stub Motoko actor with placeholder product logic. App supports: patient login, browsing hospitals/doctors, booking tokens, real-time token regulation by doctors, session management.

No admin panel exists. Doctor codes are hardcoded (DOC001-003). Hospital and doctor data is seeded in frontend `data/seed.ts`. No persistent backend data for hospitals, doctors, patients, bookings, or sessions.

## Requested Changes (Diff)

### Add
- Admin login: separate tab on LoginPage with a master admin code (e.g. ADMIN-001)
- Admin role to AppUser type and router
- `/admin` route and full Admin Panel section with sidebar navigation
- Admin Dashboard: stat cards for total hospitals, doctors, patients, bookings, active sessions; manual refresh button
- Admin Hospital Management: list hospitals with doctor counts; create hospital form (name, location, address, phone); delete hospital with safety check (blocked if doctors assigned); upload/delete hospital photo via blob storage
- Admin Doctor Management: list all doctors with hospital name, phone, specialty, code; create doctor form (name, phone, specialty, hospitalId, consultationFee, tokensPerSession) with auto-generated sequential code (DOC-00001 format); update doctor (availability, fee, specialty, hospital); delete doctor (cascades to sessions/tokens/bookings); toggle availability
- Admin Patient Management: read-only list of all registered patients with booking counts
- Admin Session Management: list all sessions with doctor name; cancel upcoming sessions
- Admin Booking Management: list last 100 bookings with patient name, doctor name, date, session, token, status
- Extend store: addHospital, deleteHospital, addDoctor, deleteDoctor (cascade), updateDoctor extended, admin-specific state
- Extend router with `/admin` and sub-routes
- Admin-accessible localStorage keys for hospitals and patients

### Modify
- LoginPage: add third tab "Admin Login" with code input
- RouterContext: add admin routes
- useAppStore: add admin CRUD operations, addHospital, deleteHospital, addDoctor with auto-code generation, deleteDoctor with cascade
- seed.ts: assign proper addresses and phone numbers to hospitals; add admin code constant
- App.tsx: route to AdminPanel when user.role === 'admin'
- TopNav: show admin-specific nav items when role is admin

### Remove
- Nothing removed; existing patient/doctor functionality stays intact

## Implementation Plan
1. Extend types.ts: add AdminUser to AppUser union, add address/phone to Hospital type, add consultationFee/availability/phone to Doctor type
2. Update seed.ts: fill hospital address/phone, doctor phone/availability/consultationFee fields; add ADMIN_CODE constant
3. Extend useAppStore: add hospitals state with CRUD; add patient tracking (register patients on login); extend doctor operations; add admin helpers for stats
4. Update RouterContext: add /admin route and sub-paths
5. Update LoginPage: add admin tab
6. Update App.tsx: route admin role to AdminPanel
7. Create AdminPanel: sidebar with 6 sections, each a sub-page component
   - AdminDashboard (stats cards + refresh)
   - AdminHospitals (list + create form + delete + photo upload)
   - AdminDoctors (list + create + update + delete + toggle)
   - AdminPatients (read-only list)
   - AdminSessions (list + cancel)
   - AdminBookings (last 100, read-only)
