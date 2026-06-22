// Centralized revenue model — every money calculation goes through here.
// Regular lots: Rakna keeps 1 LYD for every 3 LYD charged (33.3%).
// B2B partners pay a monthly subscription PLUS a lower per-booking share.

export const RAKNA_SHARE = 1 / 3   // ~33.3 % of every booking
export const OWNER_SHARE = 2 / 3   // ~66.7 % goes to the parking owner

// B2B subscription tiers — monthly fee + per-transaction share
export const B2B_TIERS = {
  starter: { monthly: 0,   raknaShare: 0.40, ownerShare: 0.60 },
  growth:  { monthly: 199, raknaShare: 0.28, ownerShare: 0.72 },
  pro:     { monthly: 449, raknaShare: 0.15, ownerShare: 0.85 },
  ent:     { monthly: null, raknaShare: 0.40, ownerShare: 0.60 }, // negotiated
}

// Time-picker: 07:00 – 22:00 on the hour
export const HOUR_MIN = 7
export const HOUR_MAX = 22
export const HOUR_OPTIONS = Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }, (_, i) => i + HOUR_MIN)

export function fmtHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

// Full-day parameters
export const FULL_DAY_HOURS = 12
export const FULL_DAY_DISCOUNT = 0.85   // 15% off vs hourly

export function getDuration(fromHour, toHour, fullDay = false) {
  return fullDay ? FULL_DAY_HOURS : Math.max(1, toHour - fromHour)
}

export function calcTotal(pricePerHour, fromHour, toHour, fullDay = false) {
  const hours = getDuration(fromHour, toHour, fullDay)
  const raw = pricePerHour * hours * (fullDay ? FULL_DAY_DISCOUNT : 1)
  return Math.round(raw * 100) / 100
}

export function calcSplit(total, raknaShare = RAKNA_SHARE) {
  const rakna = Math.round(total * raknaShare * 100) / 100
  const owner = Math.round((total - rakna) * 100) / 100
  return { total, rakna, owner }
}

// Convenience: calculate everything in one call (used in ConfirmBookingSheet)
export function buildBookingPricing(pricePerHour, fromHour, toHour, fullDay = false) {
  const total = calcTotal(pricePerHour, fromHour, toHour, fullDay)
  const duration = getDuration(fromHour, toHour, fullDay)
  const { rakna, owner } = calcSplit(total)
  return { total, duration, raknaRevenue: rakna, ownerRevenue: owner, fromHour, toHour, fullDay }
}
