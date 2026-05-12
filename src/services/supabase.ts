import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ikcvdepqiozmugiixxps.supabase.co',
  'sb_publishable_-jxAg_XhmxUMffYrS0aucw_kAVfGDGA'
)

// Session ID unique par visite (pas de compte requis)
export const SESSION_ID: string = (() => {
  const key = '_atbl_sid'
  let id = sessionStorage.getItem(key)
  if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem(key, id) }
  return id
})()

export type EventType = 'view' | 'reserve' | 'instagram' | 'call' | 'delivery' | 'order'

export async function trackEvent(
  eventType: EventType,
  restaurantName: string,
  influencerHandles: string[]   // index 0 = le plus récent
) {
  try {
    await supabase.from('events').insert({
      event_type: eventType,
      restaurant_name: restaurantName,
      primary_influencer: influencerHandles[0] ?? null,
      influencer_handles: influencerHandles,
      session_id: SESSION_ID
    })
  } catch (err) {
    console.warn('Tracking failed:', err)
  }
}

// ── Calcul des commissions ───────────────────────────────────────────────────
// 1€ par clic réservation
export const CLICK_VALUE = 1

export function getCommissionRates(count: number): number[] {
  if (count === 1) return [0.15]
  if (count === 2) return [0.10, 0.05]
  if (count === 3) return [0.07, 0.05, 0.03]
  return Array.from({ length: count }, (_, i) => i === 0 ? 0.07 : i === 1 ? 0.05 : 0.03)
}

export const ADMIN_RATE = 0.03
