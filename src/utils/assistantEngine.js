// Rukna's brain — a bilingual, data-grounded intent engine that both ANSWERS
// questions and proposes ACTIONS the app can perform. Works with no API key;
// when the Claude proxy is available we use its text but still attach these
// actions so the assistant stays "agentic".
import { PARKING_LOTS } from './constants'
import { LOT_SPOTS, ZONE_META, ZONE_ORDER } from './spotsData'

const short = (name) => name.replace(' Parking', '').replace(' Lot', '').trim()
const A = (label, kind, extra = {}) => ({ label, kind, ...extra })

// ---- live context from real app data ----
export function buildContext(profile, bookings = []) {
  const lots = PARKING_LOTS.map((l) => ({
    id: l.id, name: l.name, address: l.address,
    available: l.availableSpots, total: l.totalSpots, price: l.pricePerHour,
    open24h: l.open24h, full: l.availableSpots === 0,
  }))
  const layout = LOT_SPOTS['1']
  const zones = layout
    ? ZONE_ORDER.filter((z) => layout.zones[z]).map((z) => ({
        prefix: ZONE_META[z].prefix, label: ZONE_META[z].label,
        free: layout.zones[z].spots.filter((s) => s.status === 'available').length,
        total: layout.zones[z].spots.length,
      }))
    : []
  const user = {
    signedIn: !!profile,
    name: profile?.name || '',
    points: profile?.points || 0,
    walletBalance: profile?.walletBalance || 0,
    vehicles: (profile?.vehicles || []).length,
    activeBookings: bookings.filter((b) => b.status === 'active').length,
  }
  return { lots, zones, user }
}

const availableLots = (lots) => lots.filter((l) => l.available > 0)
const cheapest = (lots) => [...availableLots(lots)].sort((a, b) => a.price - b.price || b.available - a.available)[0]
const mostFree = (lots) => [...lots].sort((a, b) => b.available - a.available)[0]
const fullLots = (lots) => lots.filter((l) => l.full)

// proactive "best pick right now"
export function bestPick(ctx) {
  return cheapest(ctx.lots) || null
}

export function suggestions(lang) {
  const ar = lang === 'ar'
  return [
    { label: ar ? 'أرخص موقف' : 'Cheapest parking', q: 'cheapest' },
    { label: ar ? 'أين أركن؟' : 'Where can I park?', q: 'where can i park' },
    { label: ar ? 'نقاطي' : 'My points', q: 'my points' },
    { label: ar ? 'شحن المحفظة' : 'Top up wallet', q: 'top up' },
    { label: ar ? 'كيف يعمل الطابور؟' : 'How does the queue work?', q: 'how does the queue work' },
  ]
}

export function greeting(ctx, lang) {
  const ar = lang === 'ar'
  let text = ar
    ? 'مرحباً! أنا ركنة، مساعدك الذكي. أقدر ألاقي لك موقف، أعرض نقاطك ومحفظتك، أحجز، أو أنقلك لأي صفحة في التطبيق.'
    : "Hi! I'm Rukna, your smart assistant. I can find you parking, show your points or wallet, join a queue, or take you anywhere in the app."
  const actions = []
  const best = bestPick(ctx)
  if (best) {
    text += ar
      ? ` الآن أفضل خيار: ${best.name} — ${best.available} مكان متاح بسعر ${best.price} دل/ساعة.`
      : ` Right now the best pick is ${best.name} — ${best.available} free at ${best.price} LYD/hr.`
    actions.push(A(ar ? `افتح ${short(best.name)}` : `Open ${short(best.name)}`, 'lotSpots', { lotId: best.id, lotName: best.name }))
  }
  return { text, actions }
}

// ---- main intent resolver: returns { text, actions } ----
export function answer(query, ctx, lang) {
  const ar = lang === 'ar'
  const q = (query || '').toLowerCase()
  const lots = ctx.lots
  const u = ctx.user

  const has = (re) => re.test(q)
  const namedLot = lots.find((l) => q.includes(l.name.toLowerCase()) || q.includes(short(l.name).toLowerCase()))

  // ---- help / capabilities ----
  if (has(/help|what can you|what do you do|capabilit|مساعدة|ماذا تفعل|كيف تساعد|وش تسوي|شو تعمل/)) {
    return {
      text: ar
        ? 'أقدر أساعدك في: إيجاد أرخص أو أقرب موقف، عرض الأماكن المتاحة لكل منطقة، نقاطك ورصيد محفظتك وحجوزاتك، شرح الطابور الذكي، والانتقال لأي صفحة. جرّب الأزرار بالأسفل.'
        : 'I can: find the cheapest or most available parking, show free spaces per zone, your points / wallet / bookings, explain the smart queue, and take you to any page. Try the chips below.',
      actions: [
        A(ar ? 'أرخص موقف' : 'Cheapest', 'ask', { q: 'cheapest' }),
        A(ar ? 'نقاطي' : 'My points', 'route', { to: '/loyalty' }),
        A(ar ? 'محفظتي' : 'My wallet', 'route', { to: '/wallet' }),
      ],
    }
  }

  // ---- top up (before generic wallet) ----
  if (has(/top.?up|recharge|add money|اشحن|شحن|أضف رصيد|اضف رصيد/)) {
    return {
      text: ar
        ? `رصيدك الحالي ${u.walletBalance} دل. خلّيني أفتح لك صفحة الشحن.`
        : `Your balance is ${u.walletBalance} LYD. Let me open the top-up page.`,
      actions: [A(ar ? 'شحن المحفظة' : 'Top up wallet', 'route', { to: '/wallet' })],
    }
  }

  // ---- wallet / balance ----
  if (has(/wallet|balance|محفظة|رصيد/)) {
    return {
      text: u.signedIn
        ? (ar ? `رصيد محفظتك ${u.walletBalance} دل. تقدر تدفع بضغطة واحدة أو تشحن المزيد.` : `Your wallet balance is ${u.walletBalance} LYD. You can pay in one tap or top up.`)
        : (ar ? 'سجّل الدخول لعرض محفظتك.' : 'Sign in to see your wallet.'),
      actions: [A(ar ? 'فتح المحفظة' : 'Open wallet', 'route', { to: u.signedIn ? '/wallet' : '/login' })],
    }
  }

  // ---- points / loyalty ----
  if (has(/point|loyalt|reward|نقاط|نقطة|مكافآت|ولاء/)) {
    return {
      text: u.signedIn
        ? (ar ? `لديك ${u.points} نقطة (≈ ${(u.points * 0.1).toFixed(1)} دل). تكسب نقاط مع كل حجز وتستبدلها بساعات مجانية.` : `You have ${u.points} points (≈ ${(u.points * 0.1).toFixed(1)} LYD). Earn points on every booking and redeem them for free hours.`)
        : (ar ? 'سجّل الدخول لعرض نقاط الولاء.' : 'Sign in to see your loyalty points.'),
      actions: [A(ar ? 'المكافآت' : 'Rewards', 'route', { to: u.signedIn ? '/loyalty' : '/login' })],
    }
  }

  // ---- my bookings ----
  if (has(/my book|reservation|booking|حجز|حجوزات|حجوزاتي/)) {
    return {
      text: u.signedIn
        ? (ar ? `لديك ${u.activeBookings} حجز نشط. أقدر أعرض كل حجوزاتك.` : `You have ${u.activeBookings} active booking(s). I can show all your bookings.`)
        : (ar ? 'سجّل الدخول لعرض حجوزاتك.' : 'Sign in to see your bookings.'),
      actions: [A(ar ? 'حجوزاتي' : 'My bookings', 'route', { to: u.signedIn ? '/my-reservations' : '/login' })],
    }
  }

  // ---- vehicles ----
  if (has(/vehicle|my car|plate|سيارت|سيارتي|مركبة|لوحة/)) {
    return {
      text: ar ? `لديك ${u.vehicles} سيارة محفوظة. لوحتك الرئيسية تُملأ تلقائياً عند الحجز.` : `You have ${u.vehicles} saved vehicle(s). Your primary plate auto-fills bookings.`,
      actions: [A(ar ? 'سياراتي' : 'My vehicles', 'route', { to: u.signedIn ? '/my-vehicles' : '/login' })],
    }
  }

  // ---- how to book ----
  if (has(/how.*(book|reserve|park)|كيف.*(حجز|احجز|اركن)|طريقة الحجز/)) {
    const best = cheapest(lots)
    return {
      text: ar
        ? 'الحجز بسيط: اختر موقف ← اضغط مكان أخضر على الخريطة ← اتبع الطريق ← ادفع بالبطاقة أو المحفظة. أقدر أبدأ لك الآن.'
        : 'Booking is simple: pick a lot → tap a green spot on the map → follow the route → pay by card or wallet. I can start it for you.',
      actions: best ? [A(ar ? `احجز في ${short(best.name)}` : `Book at ${short(best.name)}`, 'lotSpots', { lotId: best.id, lotName: best.name })] : [],
    }
  }

  // ---- queue / full ----
  if (has(/queue|wait|full|in line|طابور|انتظار|ممتلئ|الدور/)) {
    const full = fullLots(lots)
    if (full.length) {
      const f = full[0]
      return {
        text: ar
          ? `${f.name} ممتلئ الآن. تقدر تنضم لطابور الانتظار وأنبهك فور توفر مكان — حسب الأسبقية.`
          : `${f.name} is full right now. You can join the waiting queue and I'll alert you the moment a space opens — first come, first served.`,
        actions: [A(ar ? `انضم لطابور ${short(f.name)}` : `Join ${short(f.name)} queue`, 'queue', { lotId: f.id, lotName: f.name })],
      }
    }
    return {
      text: ar
        ? 'الطابور الذكي يشتغل لما يمتلئ موقف: تنضم للطابور، وأول ما يفضى مكان أعرضه على أول شخص بالدور لمدة محدودة. حالياً كل المواقف فيها أماكن متاحة.'
        : "The smart queue kicks in when a lot is full: you join, and the moment a space frees up I offer it to the first person in line for a limited time. Right now every lot has space.",
      actions: [],
    }
  }

  // ---- price / cost ----
  if (has(/price|cost|rate|how much|سعر|كم|تكلفة|بكم/)) {
    if (namedLot) {
      return { text: ar ? `سعر ${namedLot.name} هو ${namedLot.price} دل/ساعة.` : `${namedLot.name} costs ${namedLot.price} LYD/hr.`, actions: [A(ar ? `افتح ${short(namedLot.name)}` : `Open ${short(namedLot.name)}`, 'lotSpots', { lotId: namedLot.id, lotName: namedLot.name })] }
    }
    const list = [...lots].sort((a, b) => a.price - b.price).map((l) => `${short(l.name)} ${l.price} ${ar ? 'دل' : 'LYD'}`).join(' · ')
    return { text: (ar ? 'الأسعار للساعة: ' : 'Prices per hour: ') + list, actions: [] }
  }

  // ---- hours ----
  if (has(/hour|open|close|ساعات|مفتوح|يفتح|يغلق|دوام/)) {
    const open24 = lots.filter((l) => l.open24h).map((l) => short(l.name)).join(', ')
    return { text: ar ? `هذه المواقف تعمل 24 ساعة: ${open24 || 'لا يوجد'}. الباقي نهاراً.` : `Open 24 hours: ${open24 || 'none'}. The rest are daytime only.`, actions: [] }
  }

  // ---- zones ----
  if (has(/zone|section|منطقة|مناطق|قسم/) && ctx.zones.length) {
    const list = ctx.zones.map((z) => `${z.prefix} (${z.label}) ${z.free}/${z.total}`).join(' · ')
    return { text: (ar ? 'المناطق المتاحة: ' : 'Zones (free/total): ') + list, actions: [A(ar ? 'افتح الخريطة' : 'Open map', 'lotSpots', { lotId: '1', lotName: PARKING_LOTS[0].name })] }
  }

  // ---- news / offers ----
  if (has(/news|offer|promo|deal|أخبار|عروض|خبر/)) {
    return { text: ar ? 'عندنا أخبار وعروض محدّثة — خلّيني أوديك للصفحة.' : "We've got fresh news and offers — let me take you there.", actions: [A(ar ? 'الأخبار' : 'News', 'route', { to: '/news' })] }
  }

  // ---- partner / business ----
  if (has(/partner|business|list.*space|عمل|شراكة|شريك|مساحتي/)) {
    return { text: ar ? 'لديك مساحة أو موقف؟ تقدر تخليه موقف ذكي معنا وتربح منه.' : 'Have a space or lot? You can turn it into smart parking with us and earn from it.', actions: [A(ar ? 'ركنة للأعمال' : 'Rakna for Business', 'route', { to: '/partner' })] }
  }

  // ---- cheapest ----
  if (has(/cheap|lowest|أرخص|ارخص|رخيص|أقل سعر|اقل سعر/)) {
    const c = cheapest(lots)
    if (!c) return fullFallback(ctx, ar)
    return {
      text: ar ? `أرخص خيار متاح: ${c.name} — ${c.price} دل/ساعة، وفيه ${c.available} مكان.` : `Cheapest available: ${c.name} at ${c.price} LYD/hr with ${c.available} free.`,
      actions: [A(ar ? `احجز في ${short(c.name)}` : `Book ${short(c.name)}`, 'lotSpots', { lotId: c.id, lotName: c.name })],
    }
  }

  // ---- availability / where to park / nearest ----
  if (has(/where|park|available|free|space|spot|nearest|closest|أين|اين|اركن|أركن|ركن|متاح|فاضي|مكان|أقرب|اقرب/)) {
    const m = mostFree(lots)
    if (!m || m.available === 0) return fullFallback(ctx, ar)
    const list = availableLots(lots).slice(0, 3).map((l) => `${short(l.name)} (${l.available})`).join(' · ')
    return {
      text: ar ? `أكثر موقف فيه أماكن: ${m.name} — ${m.available} من ${m.total}. خيارات: ${list}.` : `Most space: ${m.name} — ${m.available} of ${m.total} free. Options: ${list}.`,
      actions: [A(ar ? `افتح ${short(m.name)}` : `Open ${short(m.name)}`, 'lotSpots', { lotId: m.id, lotName: m.name })],
    }
  }

  // ---- greeting ----
  if (has(/hello|^hi|hey|salam|سلام|مرحبا|أهلا|اهلا|هلا/)) {
    return greeting(ctx, lang)
  }

  // ---- fallback ----
  return {
    text: ar
      ? 'أقدر أساعدك في المواقف والأسعار والأماكن المتاحة والطابور والنقاط والمحفظة. جرّب: «أرخص موقف» أو «أين أركن؟» أو «نقاطي».'
      : 'I can help with parking, prices, availability, the queue, points and your wallet. Try: "cheapest parking", "where can I park?" or "my points".',
    actions: [
      A(ar ? 'أرخص موقف' : 'Cheapest', 'ask', { q: 'cheapest' }),
      A(ar ? 'أين أركن؟' : 'Where to park', 'ask', { q: 'where can i park' }),
    ],
  }
}

function fullFallback(ctx, ar) {
  const full = fullLots(ctx.lots)[0]
  if (full) {
    return {
      text: ar ? 'كل المواقف ممتلئة الآن — أنصحك تنضم لطابور الانتظار وأنبهك فور توفر مكان.' : "Every lot is full right now — I'd join the waiting queue and I'll alert you when a space opens.",
      actions: [A(ar ? `انضم لطابور ${short(full.name)}` : `Join ${short(full.name)} queue`, 'queue', { lotId: full.id, lotName: full.name })],
    }
  }
  return { text: ar ? 'لا توجد أماكن متاحة حالياً.' : 'No free spaces right now.', actions: [] }
}
