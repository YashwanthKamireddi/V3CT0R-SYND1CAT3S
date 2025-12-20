# Kaushik's Backend - Campus Pulse Free Firebase Integration

## Overview
This folder contains the **100% free** backend solution for Campus Pulse, using Firebase's free tier (Spark plan).

## What's Included

### Backend Services (`/functions/`)
- Firebase Functions structure (for reference/future use if billing is enabled)
- Firestore Rules (`firestore.rules`) - **DEPLOYED**

### Client-Side Services (Root files)
These services run on the frontend, eliminating the need for paid Cloud Functions:

| File | Purpose |
|------|---------|
| `firebase.ts` | Firebase SDK initialization |
| `types.ts` | TypeScript interfaces (User, Event, Registration) |
| `eventService.ts` | Event CRUD operations |
| `registrationService.ts` | Event registration with conflict checking |
| `attendanceService.ts` | QR attendance verification |
| `authService.ts` | User authentication (email/Google) |

## Free Tier Limits (Generous!)

| Service | Free Limit |
|---------|-----------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Auth users | 50,000/month |
| Storage | 5 GB |

## Setup Instructions

See `FIREBASE_SETUP.md` for how to configure your Firebase project.

## Author
**Ande Kaushik** (andekaushik@gmail.com)
