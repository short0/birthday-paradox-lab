'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  computeBirthdayBound,
  computeCollisionProbability,
  computePairCount,
  PRESETS,
  type Preset,
  getRiskLevel,
} from '@/lib/presets'

export type Screen = 'home' | 'lab'
export type Mode = 'simulated' | 'live'

export interface LabState {
  presetId: string
  sampleSize: number
  spaceSize: number
  mode: Mode
  notes: string
}

export interface ComputedResult {
  collisionProbability: number
  pairCount: number
  birthdayBound: number
  riskLevel: 'low' | 'medium' | 'high'
  intuitiveGuess: number
}

const DEFAULT_STATE: LabState = {
  presetId: 'birthday-room',
  sampleSize: 23,
  spaceSize: 365,
  mode: 'simulated',
  notes: '',
}

const MAX_HISTORY = 50

function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

function computeResults(state: LabState): ComputedResult {
  const { sampleSize, spaceSize } = state
  const prob = computeCollisionProbability(sampleSize, spaceSize)
  const pairs = computePairCount(sampleSize)
  const bound = computeBirthdayBound(spaceSize)
  const riskLevel = getRiskLevel(prob)
  // Intuitive (wrong) guess: what fraction of space is filled
  const intuitiveGuess = Math.min(100, (sampleSize / spaceSize) * 100)
  return {
    collisionProbability: prob,
    pairCount: pairs,
    birthdayBound: bound,
    riskLevel,
    intuitiveGuess,
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function useLabState() {
  const [screen, setScreenState] = useState<Screen>('home')
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  const [labState, setLabStateInternal] = useState<LabState>(DEFAULT_STATE)
  const [history, setHistory] = useState<LabState[]>([DEFAULT_STATE])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [initialized, setInitialized] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = loadFromStorage<'light' | 'dark'>('bpl_theme', 'light')
    const savedScreen = loadFromStorage<Screen>('bpl_screen', 'home')
    const savedState = loadFromStorage<LabState>('bpl_lab_state', DEFAULT_STATE)
    const savedHistory = loadFromStorage<LabState[]>('bpl_history', [savedState])
    const savedHistoryIndex = loadFromStorage<number>('bpl_history_index', 0)

    setThemeState(savedTheme)
    setScreenState(savedScreen)
    setLabStateInternal(savedState)
    setHistory(savedHistory)
    setHistoryIndex(savedHistoryIndex)
    setInitialized(true)
  }, [])

  // Apply dark class
  useEffect(() => {
    if (!initialized) return
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    saveToStorage('bpl_theme', theme)
  }, [theme, initialized])

  // Persist screen
  useEffect(() => {
    if (!initialized) return
    saveToStorage('bpl_screen', screen)
  }, [screen, initialized])

  // Persist lab state
  useEffect(() => {
    if (!initialized) return
    saveToStorage('bpl_lab_state', labState)
    saveToStorage('bpl_history', history)
    saveToStorage('bpl_history_index', historyIndex)
  }, [labState, history, historyIndex, initialized])

  // historyIndexRef keeps pushHistory's closure in sync without causing re-renders
  const historyIndexRef = useRef(0)
  useEffect(() => {
    historyIndexRef.current = historyIndex
  }, [historyIndex])

  const pushHistory = useCallback((newState: LabState) => {
    const currentIndex = historyIndexRef.current
    setHistory((prev) => {
      const truncated = prev.slice(0, currentIndex + 1)
      return [...truncated, newState].slice(-MAX_HISTORY)
    })
    const nextIndex = Math.min(currentIndex + 1, MAX_HISTORY - 1)
    setHistoryIndex(nextIndex)
    historyIndexRef.current = nextIndex
  }, [])

  // labStateRef gives synchronous read access to current labState
  const labStateRef = useRef(labState)
  useEffect(() => {
    labStateRef.current = labState
  }, [labState])

  // setLabState: update state AND push to history (use for discrete committed changes)
  const setLabState = useCallback(
    (updater: LabState | ((prev: LabState) => LabState)) => {
      const next =
        typeof updater === 'function' ? updater(labStateRef.current) : updater
      setLabStateInternal(next)
      pushHistory(next)
    },
    [pushHistory]
  )

  // setLabStateLive: update state WITHOUT pushing to history (use during drag)
  const setLabStateLive = useCallback(
    (updater: LabState | ((prev: LabState) => LabState)) => {
      setLabStateInternal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        return next
      })
    },
    []
  )

  const setScreen = useCallback((s: Screen) => {
    setScreenState(s)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const loadPreset = useCallback(
    (id: string) => {
      const preset = getPreset(id)
      const next: LabState = {
        presetId: id,
        sampleSize: preset.sampleSize,
        spaceSize: preset.spaceSize,
        mode: labState.mode,
        notes: labState.notes,
      }
      setLabState(next)
      setScreenState('lab')
    },
    [labState.mode, labState.notes, setLabState]
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setLabStateInternal(history[newIndex])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setLabStateInternal(history[newIndex])
    }
  }, [history, historyIndex])

  const resetToHome = useCallback(() => {
    setLabStateInternal(DEFAULT_STATE)
    setHistory([DEFAULT_STATE])
    setHistoryIndex(0)
    setScreenState('home')
  }, [])

  const activePreset = getPreset(labState.presetId)
  const computed = computeResults(labState)

  return {
    screen,
    theme,
    labState,
    history,
    historyIndex,
    activePreset,
    computed,
    initialized,
    setScreen,
    toggleTheme,
    loadPreset,
    setLabState,
    setLabStateLive,
    undo,
    redo,
    resetToHome,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }
}
