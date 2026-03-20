import { create } from 'zustand'
import { startSession, completeSession } from '../api/sessions'

const DURATIONS = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 }

export const useTimerStore = create((set, get) => ({
  mode: 'focus',           // 'focus' | 'short_break' | 'long_break'
  secondsLeft: 25 * 60,
  isRunning: false,
  currentSessionId: null,
  isCompleting: false,
  sessionCount: 0,         // completed focus sessions in current cycle

  tick: () => {
    const { secondsLeft, isRunning } = get()
    if (!isRunning) return
    if (secondsLeft <= 0) {
      get().complete()
    } else {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },

  start: async () => {
    const { isRunning, mode, currentSessionId } = get()
    if (isRunning) return

    set({ isRunning: true })

    if (currentSessionId) return

    try {
      const response = await startSession(mode)
      set({ currentSessionId: response.data.session_id || null })
    } catch (error) {
      set({ currentSessionId: null })
    }
  },
  pause: () => set({ isRunning: false }),
  reset: () => {
    const { mode } = get()
    set({ isRunning: false, secondsLeft: DURATIONS[mode] })
  },

  complete: async () => {
    const { mode, sessionCount, currentSessionId, isCompleting } = get()
    if (isCompleting) return { completedFocus: false }

    set({ isRunning: false, isCompleting: true })

    if (currentSessionId) {
      try {
        await completeSession(currentSessionId)
      } catch (error) {
        // keep local timer flow even if backend call fails
      }
    }

    if (mode === 'focus') {
      const newCount = sessionCount + 1
      const nextMode = newCount % 4 === 0 ? 'long_break' : 'short_break'
      set({
        isRunning: false,
        isCompleting: false,
        currentSessionId: null,
        sessionCount: newCount,
        mode: nextMode,
        secondsLeft: DURATIONS[nextMode],
      })
      return { completedFocus: true, sessionCount: newCount }
    } else {
      set({
        isRunning: false,
        isCompleting: false,
        currentSessionId: null,
        mode: 'focus',
        secondsLeft: DURATIONS.focus,
      })
      return { completedFocus: false }
    }
  },

  setMode: (mode) => set({ mode, isRunning: false, secondsLeft: DURATIONS[mode] }),
}))