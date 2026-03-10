import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timerStore'

export function useTimer() {
  const { tick, isRunning, ...state } = useTimerStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, tick])

  return { ...state, isRunning }
}