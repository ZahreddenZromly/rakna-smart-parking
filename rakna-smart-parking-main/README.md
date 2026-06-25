# Rakna — ركنة · Smart Parking (Bourguiba, Tripoli)

A GIS-enabled smart-parking web app for the Bourguiba parking area in Tripoli, Libya.
Drivers find/reserve spots; operators & admins manage occupancy, content and users.

**Live demo:** https://bourguiba-parking.vercel.app

---

## Tech stack
- **Frontend:** React 19 + Vite, React Router
- **Map:** React-Leaflet (OpenStreetMap / CARTO tiles) + a CAD facility map (SVG)
- **Backend / DB:** Firebase (Auth + Cloud Firestore) — project `smart-parking-9a26b`
- **Charts:** Recharts · **QR:** qrcode.react
- **Styling:** inline styles + CSS-variable theme (light/dark) · **Font:** Tajawal
- **i18n:** Arabic (default, RTL) + English

## Run locally
```bash
npm install
npm run dev          # http://localhost:5188
npm run build        # production build -> dist/
```
Firebase web keys have safe fallbacks in `src/firebase/config.js`; to override, copy
`.env` (see `VITE_FIREBASE_*`). These web keys are not secrets — security is enforced
by Firestore rules (`firestore.rules`) which must be published in the Firebase console.

---

## Project structure
```
src/
  firebase/        # all backend access (auth, users, reservations, content, admin)
    config.js          Firebase init (auth, db)
    authService.js     register / login / logout / phone-OTP / ensureUserDoc
    userService.js     profile, loyalty points, wallet (top-up / pay), heartbeat
    reservationService.js  create / list / cancel reservations
    contentService.js  ads + news (CRUD, likes, views) with built-in fallbacks
    adminService.js    users list, roles, activate, lots, analytics queries
  context/         # SettingsContext (theme/lang/voice/text-size), AuthContext
  pages/           # screens (driver) + pages/admin/* (admin console)
  components/      # common (Icon, MobileLayout, TopBar), parking, home, admin
  utils/           # constants (lots), spotsData (zones), realSpots (from DXF), image
  i18n/            # translations.js (ar + en)
```

## Firestore data model
| Collection | Doc fields |
|---|---|
| `users/{uid}` | name, email, phone, **role** (`user`/`admin`), active, points, walletBalance, plate, carType, lastSeen |
| `users/{uid}/walletTxns/{id}` | type (`topup`/`payment`), amount, method, createdAt |
| `reservations/{id}` | userId, lotId, lotName, spot, zone, total, paymentMethod, status, createdAt |
| `lots/{id}` | admin overrides: availableSpots, totalSpots, pricePerHour |
| `ads/{id}` | title, subtitle, image (base64), bg, order |
| `news/{id}` | title, body, image (base64), views, likes (+ `views/`, `reactions/` subcollections) |

Security rules: see [`firestore.rules`](./firestore.rules). A user's `role` field controls
admin access; set the first admin manually in the Firestore console.

## Real parking layout
The surveyed CAD plan is in `public/bourguiba-map.svg`. Spot coordinates were extracted
from the AutoCAD DXF into `src/utils/realSpots.js` (zones: A=Taxi, B=Reservation,
C=Regular, D=Bus, + Disability), each with entrance/exit.

---

## Where the backend dev can help next
- Move parking-lot data fully into Firestore (`lots`) + live spot availability (IoT-ready).
- Real SMS OTP (Firebase Phone Auth) instead of the current demo OTP.
- Real payments (card / bank transfer) + wallet ledger hardening.
- Cloud Functions for analytics aggregation, booking expiry, and notifications.
- Image upload via Firebase Storage (currently base64 in Firestore to stay on free tier).

Built with React + Firebase.
