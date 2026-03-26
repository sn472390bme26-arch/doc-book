# Doctor Booked

## Current State
All data (hospitals, doctors, bookings, sessions) is stored in localStorage. However, the store on initialization always re-merges seed data (SEED_HOSPITALS, SEED_DOCTORS), causing deleted doctors and hospitals to reappear after a page refresh.

## Requested Changes (Diff)

### Add
- `LS_DELETED_DOCTORS` localStorage key to track explicitly deleted seed doctor IDs
- `LS_HOSPITALS_INITIALIZED` localStorage key to mark that hospitals have been seeded (empty) on first run

### Modify
- `initDoctors()`: filter out seed doctors whose IDs are in the deleted list before merging
- `initHospitals()`: on first load, save empty array and mark initialized; subsequent loads only use what is in localStorage — no seed hospitals ever injected
- `deleteDoctor()`: when deleting a seed doctor, also persist its ID to `LS_DELETED_DOCTORS`

### Remove
- Automatic fallback to SEED_HOSPITALS when localStorage is empty
- Import of SEED_HOSPITALS from seed.ts in the store

## Implementation Plan
1. Update `useAppStore.ts` with new init logic and deleteDoctor tracking — done.
