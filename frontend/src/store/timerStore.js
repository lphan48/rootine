import { create } from 'zustand'

const DURATIONS = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 }

export const useTimerStore = create((set, get) => ({
  mode: 'focus',           // 'focus' | 'short_break' | 'long_break'
  secondsLeft: 25 * 60,
  isRunning: false,
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

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => {
    const { mode } = get()
    set({ isRunning: false, secondsLeft: DURATIONS[mode] })
  },

  complete: () => {
    const { mode, sessionCount } = get()
    if (mode === 'focus') {
      const newCount = sessionCount + 1
      const nextMode = newCount % 4 === 0 ? 'long_break' : 'short_break'
      set({ isRunning: false, sessionCount: newCount, mode: nextMode,
            secondsLeft: DURATIONS[nextMode] })
      return { completedFocus: true, sessionCount: newCount }
    } else {
      set({ isRunning: false, mode: 'focus', secondsLeft: DURATIONS.focus })
      return { completedFocus: false }
    }
  },

  setMode: (mode) => set({ mode, isRunning: false, secondsLeft: DURATIONS[mode] }),
}))