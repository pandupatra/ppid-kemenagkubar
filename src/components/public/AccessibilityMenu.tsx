import { useEffect, useRef, useState } from 'react'
import {
  Accessibility,
  AudioLines,
  Eye,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sun,
  SunMoon,
  Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type ThemePreference = 'system' | 'light' | 'dark'
type FontScale = '100' | '115' | '130'
type ColorVision =
  'default' | 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia'
type SpeechState = 'idle' | 'playing' | 'paused'

type AccessibilityPreferences = {
  theme: ThemePreference
  fontScale: FontScale
  reduceMotion: boolean
  colorVision: ColorVision
}

const STORAGE_KEY = 'ppid-accessibility-preferences'
const defaultPreferences: AccessibilityPreferences = {
  theme: 'system',
  fontScale: '100',
  reduceMotion: false,
  colorVision: 'default',
}

const themeOptions = [
  { value: 'system', label: 'Perangkat', icon: SunMoon },
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
] as const

const fontOptions = [
  { value: '100', label: 'Standar' },
  { value: '115', label: 'Besar' },
  { value: '130', label: 'Sangat besar' },
] as const

const colorVisionOptions = [
  { value: 'default', label: 'Standar' },
  { value: 'high-contrast', label: 'Kontras tinggi' },
  { value: 'protanopia', label: 'Kesulitan merah' },
  { value: 'deuteranopia', label: 'Kesulitan hijau' },
  { value: 'tritanopia', label: 'Kesulitan biru' },
] as const

function isPreferences(value: unknown): value is AccessibilityPreferences {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AccessibilityPreferences>
  return (
    ['system', 'light', 'dark'].includes(candidate.theme ?? '') &&
    ['100', '115', '130'].includes(candidate.fontScale ?? '') &&
    typeof candidate.reduceMotion === 'boolean' &&
    [
      'default',
      'high-contrast',
      'protanopia',
      'deuteranopia',
      'tritanopia',
    ].includes(candidate.colorVision ?? '')
  )
}

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement
  const resolvedTheme =
    preferences.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : preferences.theme

  root.dataset.theme = resolvedTheme
  root.dataset.themePreference = preferences.theme
  root.dataset.fontScale = preferences.fontScale
  root.dataset.reduceMotion = String(preferences.reduceMotion)
  root.dataset.colorVision = preferences.colorVision
}

function splitSpeechText(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized]
  const chunks: string[] = []

  for (const sentence of sentences) {
    const cleanSentence = sentence.trim()
    if (cleanSentence.length <= 220) {
      chunks.push(cleanSentence)
      continue
    }

    const words = cleanSentence.split(' ')
    let chunk = ''
    for (const word of words) {
      if (`${chunk} ${word}`.trim().length > 220) {
        if (chunk) chunks.push(chunk)
        chunk = word
      } else {
        chunk = `${chunk} ${word}`.trim()
      }
    }
    if (chunk) chunks.push(chunk)
  }

  return chunks
}

export function AccessibilityMenu() {
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(defaultPreferences)
  const [speechState, setSpeechState] = useState<SpeechState>('idle')
  const [speechSupported, setSpeechSupported] = useState(true)
  const speechSession = useRef(0)

  useEffect(() => {
    setSpeechSupported(
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    )

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      if (isPreferences(saved)) {
        setPreferences(saved)
        applyPreferences(saved)
      } else {
        applyPreferences(defaultPreferences)
      }
    } catch {
      applyPreferences(defaultPreferences)
    }

    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      if (document.documentElement.dataset.themePreference === 'system') {
        document.documentElement.dataset.theme = colorScheme.matches
          ? 'dark'
          : 'light'
      }
    }
    colorScheme.addEventListener('change', syncSystemTheme)

    return () => {
      colorScheme.removeEventListener('change', syncSystemTheme)
      speechSession.current += 1
      window.speechSynthesis?.cancel()
    }
  }, [])

  function updatePreferences(next: AccessibilityPreferences) {
    setPreferences(next)
    applyPreferences(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // The settings still apply for this visit when storage is unavailable.
    }
  }

  function startReading() {
    if (!speechSupported) return
    const main = document.querySelector<HTMLElement>('#isi-utama')
    const chunks = splitSpeechText(main?.innerText ?? '')
    if (chunks.length === 0) return

    window.speechSynthesis.cancel()
    const session = speechSession.current + 1
    speechSession.current = session
    setSpeechState('playing')

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'id-ID'
      utterance.rate = 0.95
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          if (speechSession.current === session) setSpeechState('idle')
        }
      }
      utterance.onerror = () => {
        if (speechSession.current === session) setSpeechState('idle')
      }
      window.speechSynthesis.speak(utterance)
    })
  }

  function toggleReading() {
    if (speechState === 'idle') {
      startReading()
    } else if (speechState === 'playing') {
      window.speechSynthesis.pause()
      setSpeechState('paused')
    } else {
      window.speechSynthesis.resume()
      setSpeechState('playing')
    }
  }

  function stopReading() {
    speechSession.current += 1
    window.speechSynthesis.cancel()
    setSpeechState('idle')
  }

  function resetPreferences() {
    updatePreferences(defaultPreferences)
  }

  const hasCustomPreferences =
    JSON.stringify(preferences) !== JSON.stringify(defaultPreferences)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="accessibility-trigger"
          aria-label="Buka pengaturan aksesibilitas"
        >
          <Accessibility aria-hidden="true" />
          <span>Aksesibilitas</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="accessibility-sheet" side="left">
        <SheetHeader className="accessibility-sheet-header">
          <SheetTitle>Pengaturan aksesibilitas</SheetTitle>
          <SheetDescription>
            Sesuaikan tampilan dan audio halaman.
          </SheetDescription>
        </SheetHeader>

        <div className="accessibility-settings">
          <fieldset className="accessibility-setting">
            <legend>
              <SunMoon aria-hidden="true" /> Mode warna
            </legend>
            <div className="accessibility-options accessibility-options-three">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={preferences.theme === value}
                  onClick={() =>
                    updatePreferences({ ...preferences, theme: value })
                  }
                >
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="accessibility-setting">
            <legend>
              <Type aria-hidden="true" /> Ukuran teks
            </legend>
            <div className="accessibility-options accessibility-options-three">
              {fontOptions.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={preferences.fontScale === value}
                  onClick={() =>
                    updatePreferences({ ...preferences, fontScale: value })
                  }
                >
                  <span aria-hidden="true" className="font-size-sample">
                    A
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="accessibility-setting">
            <legend>
              <Eye aria-hidden="true" /> Persepsi warna
            </legend>
            <p className="accessibility-hint">
              Gunakan palet alternatif agar tautan dan tindakan lebih mudah
              dibedakan tanpa bergantung pada merah, hijau, atau biru.
            </p>
            <div className="accessibility-options accessibility-color-options">
              {colorVisionOptions.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={preferences.colorVision === value}
                  onClick={() =>
                    updatePreferences({ ...preferences, colorVision: value })
                  }
                >
                  <span className={`color-swatch color-swatch-${value}`} />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="accessibility-setting accessibility-toggle-row">
            <div>
              <strong>Kurangi animasi</strong>
              <span>Matikan gerakan dan transisi yang tidak penting.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.reduceMotion}
              className="accessibility-switch"
              onClick={() =>
                updatePreferences({
                  ...preferences,
                  reduceMotion: !preferences.reduceMotion,
                })
              }
            >
              <span aria-hidden="true" />
              <span className="sr-only">
                {preferences.reduceMotion ? 'Aktif' : 'Tidak aktif'}
              </span>
            </button>
          </div>

          <section
            className="accessibility-setting"
            aria-labelledby="audio-title"
          >
            <h3 id="audio-title">
              <AudioLines aria-hidden="true" /> Dengarkan halaman
            </h3>
            <p className="accessibility-hint">
              Pembaca audio menggunakan suara Bahasa Indonesia yang tersedia di
              perangkat Anda.
            </p>
            <div className="accessibility-audio-controls">
              <Button
                type="button"
                onClick={toggleReading}
                disabled={!speechSupported}
              >
                {speechState === 'playing' ? (
                  <Pause aria-hidden="true" />
                ) : (
                  <Play aria-hidden="true" />
                )}
                {speechState === 'idle'
                  ? 'Dengarkan'
                  : speechState === 'playing'
                    ? 'Jeda'
                    : 'Lanjutkan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopReading}
                disabled={speechState === 'idle'}
              >
                <Square aria-hidden="true" /> Hentikan
              </Button>
            </div>
            {!speechSupported && (
              <p className="accessibility-support-message" role="status">
                Pembaca audio tidak didukung oleh peramban ini.
              </p>
            )}
            <p className="sr-only" aria-live="polite">
              {speechState === 'playing'
                ? 'Pembaca audio sedang berjalan.'
                : speechState === 'paused'
                  ? 'Pembaca audio dijeda.'
                  : 'Pembaca audio berhenti.'}
            </p>
          </section>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="accessibility-reset"
          onClick={resetPreferences}
          disabled={!hasCustomPreferences}
        >
          <RotateCcw aria-hidden="true" /> Kembalikan pengaturan awal
        </Button>
      </SheetContent>
    </Sheet>
  )
}
