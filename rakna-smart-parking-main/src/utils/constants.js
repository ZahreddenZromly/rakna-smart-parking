export const SUPER_ADMINS = ['bbwd36468@gmail.com']

export const TRIPOLI_CENTER = [32.895029, 13.172721]
export const POINTS_PER_HOUR = 10
export const POINTS_TO_LYD = 0.1

export const PEAK_HOURS = [8, 9, 12, 13, 17, 18]
export const PEAK_MULTIPLIER = 1.5

export const QUEUE_OFFER_WINDOW_MS = 3 * 60 * 1000
export const QUEUE_HOLD_MS         = 15 * 60 * 1000
export const QUEUE_AVG_TURNOVER_MIN = 4

export const PARKING_LOTS = [
  {
    id: '1',
    name: 'موقف بورقيبة',
    lat: 32.895029,
    lng: 13.172721,
    totalSpots: 120,
    availableSpots: 34,
    pricePerHour: 2,
    address: 'محطة بورقيبة، طرابلس',
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
  available: '#2F8F5B',
  limited:   '#C98A1C',
  full:      '#D14343',
}

export const STATUS_LABEL = {
  available: 'متاح',
  limited:   'يمتلئ',
  full:      'ممتلئ',
}