// ============================================================
// SPOTS DATA — Bourguiba parking, REAL layout from autocad borgheba.dxf
//   Zone A = Taxi        Zone B = Reservation
//   Zone C = Regular     Zone D = Bus
//   Zone E = Disability (not in CAD yet — synthetic until engineers add it)
// status: 'available' | 'occupied' | 'reserved'
// ============================================================
import { REAL_SPOTS, SPOT_BBOX, GATES } from './realSpots'

export { SPOT_BBOX, GATES }

const rnd = (availBias) => {
  const r = Math.random()
  if (r < availBias) return 'available'
  if (r < availBias + 0.4) return 'occupied'
  return 'reserved'
}

export const ZONE_META = {
  taxi:        { label: 'Taxi',        key: 'zone_taxi',        prefix: 'A', iconName: 'taxi',       color: '#F2A900', entrance: 'Gate A1', exit: 'Gate A2' },
  reservation: { label: 'Reservation', key: 'zone_reservation', prefix: 'B', iconName: 'pin',        color: '#A55EEA', entrance: 'Gate B1', exit: 'Gate B2' },
  regular:     { label: 'Regular',     key: 'zone_regular',     prefix: 'C', iconName: 'car',        color: '#2BCBBA', entrance: 'Gate C1', exit: 'Gate C2' },
  bus:         { label: 'Bus / Coach', key: 'zone_bus',         prefix: 'D', iconName: 'bus',        color: '#6C5CE7', entrance: 'Gate D1', exit: 'Gate D2' },
  disability:  { label: 'Disability',  key: 'zone_disability',  prefix: 'E', iconName: 'accessible', color: '#0984E3', entrance: 'Gate E1', exit: 'Gate E2' },
}

export const ZONE_ORDER = ['taxi', 'reservation', 'regular', 'bus', 'disability']

// synthetic spots (no map coords) — used only for the disability zone for now
const buildSynthetic = ({ zone, prefix, count, availBias }) => {
  const spots = []
  for (let i = 0; i < count; i++) {
    const number = i + 1
    spots.push({
      id: `${prefix}-${String(number).padStart(2, '0')}`,
      zone, prefix, number, col: i % 2, row: Math.floor(i / 2),
      status: rnd(availBias), mapped: false,
    })
  }
  spots.slice(0, 3).forEach((s) => { s.status = 'available' })
  return spots
}

// real spots from the DXF, grouped by zone, with status + row/col + coordinates
const groupReal = () => {
  const byZone = {}
  REAL_SPOTS.forEach((s) => { (byZone[s.zone] ||= []).push(s) })
  const out = {}
  const bias = { taxi: 0.4, reservation: 0.45, regular: 0.4, bus: 0.5 }
  Object.entries(byZone).forEach(([zone, arr]) => {
    const spots = arr.map((s, i) => ({
      id: s.id, zone, prefix: ZONE_META[zone].prefix,
      number: parseInt(s.id.split('-')[1], 10),
      col: i % 2, row: Math.floor(i / 2),
      x: s.x, y: s.y, mapped: true,
      status: rnd(bias[zone] ?? 0.4),
    }))
    spots.slice(0, 3).forEach((s) => { s.status = 'available' })
    out[zone] = spots
  })
  return out
}

const realByZone = groupReal()

export const LOT_SPOTS = {
  '1': {
    name: 'Bourguiba Parking',
    facilityMap: '/bourguiba-map.svg',
    bbox: SPOT_BBOX,
    gates: GATES,
    zones: {
      taxi:        { label: 'Taxi',        spots: realByZone.taxi || [] },
      reservation: { label: 'Reservation', spots: realByZone.reservation || [] },
      regular:     { label: 'Regular',     spots: realByZone.regular || [] },
      bus:         { label: 'Bus / Coach', spots: realByZone.bus || [] },
      disability:  { label: 'Disability',  spots: buildSynthetic({ zone: 'disability', prefix: 'E', count: 6, availBias: 0.6 }) },
    },
  },
}

export const getAllSpots = (lotId) => {
  const lot = LOT_SPOTS[lotId]
  if (!lot) return []
  return Object.values(lot.zones).flatMap((z) => z.spots)
}

export const SPOT_COLORS = {
  available: { bg: '#EAF4FF', border: '#9CC8F5', text: '#2B6CB0' },
  occupied:  { bg: '#F1F3F5', border: '#CED4DA', text: '#ADB5BD' },
  reserved:  { bg: '#FFF3CD', border: '#FDCB6E', text: '#856404' },
  selected:  { bg: '#D6E9FF', border: '#0984E3', text: '#004085' },
}
