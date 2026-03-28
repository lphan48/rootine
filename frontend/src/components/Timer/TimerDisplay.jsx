import { useTimerStore } from '../../store/timerStore'
import { useTimer } from '../../hooks/useTimer'

export default function TimerDisplay() {
  const { secondsLeft, isRunning, mode, sessionCount, start, pause, reset } = useTimer()

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const progress = secondsLeft / (mode === 'focus' ? 1500 : mode === 'short_break' ? 300 : 900)

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - (1 - progress))

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 text-sm">
        {['focus', 'short_break', 'long_break'].map(m => (
          <button key={m}
            onClick={() => useTimerStore.getState().setMode(m)}
            className={`px-3 py-1 rounded-full ${mode === m ? 'bg-green-200 font-semibold' : 'text-gray-400'}`}>
            {m === 'focus' ? 'Focus' : m === 'short_break' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="relative h-[220px] w-[220px] mb-8">
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#86efac" strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-5xl font-sans font-semibold text-gray-700">
          {minutes}:{seconds}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={reset} className="px-4 py-2 rounded-xl border text-gray-500">Reset</button>
        <button onClick={isRunning ? pause : start}
          className="px-8 py-2 rounded-xl bg-green-400 text-white font-semibold text-lg">
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full ${i < sessionCount % 4 ? 'bg-green-400' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  )
}