// Bootstrap owner accounts — always treated as admin (no manual role setup needed).
export const SUPER_ADMINS = ['zahredden1212@gmail.com']

// Centre: Martyrs' Square (Maydan al-Shuhada), central Tripoli — the real city-centre hub.
export const TRIPOLI_CENTER = [32.89630, 13.18000]
export const POINTS_PER_HOUR = 10
export const POINTS_TO_LYD = 0.1 // 100 points = 10 LYD discount

export const PEAK_HOURS = [8, 9, 12, 13, 17, 18]
export const PEAK_MULTIPLIER = 1.5

// ---- Smart Queue & Reservation System (all configurable) ----
export const QUEUE_OFFER_WINDOW_MS = 3 * 60 * 1000  // response deadline for an offer (spec: 2–5 min)
export const QUEUE_HOLD_MS = 15 * 60 * 1000          // how long an accepted spot is held
export const QUEUE_AVG_TURNOVER_MIN = 4              // per-position estimate for ETA

// Coordinates are real points clustered around Martyrs' Square / central Tripoli.
export const PARKING_LOTS = [
  {
    id: '1',
    name: 'Martyrs Square Main Lot',
    lat: 32.89625,
    lng: 13.18010,
    totalSpots: 120,
    availableSpots: 34,
    pricePerHour: 2,
    address: "Martyrs' Square, Tripoli",
    type: 'Outdoor',
    open24h: true,
    features: ['CCTV', 'Lighting', 'Security'],
  },
  {
    id: '2',
    name: 'Al-Jumhuriya Parking',
    lat: 32.89760,
    lng: 13.18230,
    totalSpots: 80,
    availableSpots: 0,
    pricePerHour: 1.5,
    address: 'Al-Jumhuriya Street, Tripoli',
    type: 'Underground',
    open24h: false,
    features: ['CCTV', 'Covered'],
  },
  {
    id: '3',
    name: 'Old City Parking',
    lat: 32.89490,
    lng: 13.18260,
    totalSpots: 60,
    availableSpots: 22,
    pricePerHour: 1,
    address: 'Old City (Medina) Gate, Tripoli',
    type: 'Outdoor',
    open24h: true,
    features: ['Lighting'],
  },
  {
    id: '4',
    name: 'Algeria Square Lot',
    lat: 32.89400,
    lng: 13.18540,
    totalSpots: 45,
    availableSpots: 12,
    pricePerHour: 2.5,
    address: 'Algeria Square, Tripoli',
    type: 'Outdoor',
    open24h: false,
    features: ['CCTV', 'Security', 'Lighting'],
  },
  {
    id: '5',
    name: 'Central Bank Parking',
    lat: 32.89830,
    lng: 13.18060,
    totalSpots: 35,
    availableSpots: 5,
    pricePerHour: 3,
    address: 'Central Bank of Libya, Tripoli',
    type: 'Underground',
    open24h: false,
    features: ['CCTV', 'Covered', 'Security'],
  },
]

export const getAvailabilityStatus = (available, total) => {
  if (available === 0) return 'full'
  if (available / total < 0.2) return 'limited'
  return 'available'
}

export const STATUS_COLOR = {
  available: '#00b894',
  limited: '#fdcb6e',
  full: '#d63031',
}

export const STATUS_LABEL = {
  available: 'Available',
  limited: 'Almost Full',
  full: 'Full',
}

