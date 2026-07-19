// Joue un son quand une notification arrive en temps réel : soit le son
// personnalisé uploadé par l'utilisateur (notifSonUrl), soit un petit carillon
// synthétisé via l'API Web Audio (aucun fichier à héberger pour le son par
// défaut). Respecte le réglage marche/arrêt (notifSonActif).
//
// Les préférences sont mises en cache (module-level) pour éviter un appel
// réseau à chaque notification ; `invalidatePrefsCache()` doit être appelé
// après une modification des réglages (voir pages parametres/settings).

let prefsCache = null
let prefsPromise = null

const fetchPrefs = async () => {
  const token = useCookie('auth_token').value
  if (!token) return { notifSonActif: true, notifSonUrl: null }

  try {
    const config = useRuntimeConfig()
    const result = await $fetch(`${config.public.apiBase}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (result.success) {
      return {
        notifSonActif: result.data.notifSonActif !== false,
        notifSonUrl:   result.data.notifSonUrl || null
      }
    }
  } catch {
    // best-effort : si /settings échoue, on retombe sur le son par défaut actif
  }
  return { notifSonActif: true, notifSonUrl: null }
}

const getPrefs = async () => {
  if (prefsCache) return prefsCache
  if (!prefsPromise) {
    prefsPromise = fetchPrefs().then((p) => {
      prefsCache = p
      return p
    })
  }
  return prefsPromise
}

const invalidatePrefsCache = () => {
  prefsCache = null
  prefsPromise = null
}

// Petit carillon à deux notes, généré à la volée - pas de fichier audio à
// héberger/télécharger pour le son par défaut.
const playDefaultChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const notes = [
      { freq: 880,     start: 0,    dur: 0.12 },
      { freq: 1174.66, start: 0.1,  dur: 0.2 }
    ]
    notes.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.05)
    })
    setTimeout(() => ctx.close().catch(() => {}), 700)
  } catch {
    // Web Audio indisponible : on n'affiche rien, ce n'est pas bloquant
  }
}

const resolveSoundUrl = (url) => {
  if (url.startsWith('http')) return url
  const base = useRuntimeConfig().public.apiBase?.replace('/api', '') || 'http://localhost:5000'
  return `${base}${url}`
}

export const useNotificationSound = () => {
  const play = async () => {
    if (typeof window === 'undefined') return

    const prefs = await getPrefs()
    if (!prefs.notifSonActif) return

    if (prefs.notifSonUrl) {
      try {
        const audio = new Audio(resolveSoundUrl(prefs.notifSonUrl))
        audio.volume = 0.6
        await audio.play()
        return
      } catch {
        // Fichier personnalisé indisponible/bloqué par le navigateur → repli sur le son par défaut
      }
    }

    playDefaultChime()
  }

  return { play, invalidatePrefsCache }
}
