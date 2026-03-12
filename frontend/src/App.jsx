import { useState, useEffect } from "react"
import TimerDisplay from "./components/Timer/TimerDisplay"
import AuthForm from "./components/Auth/AuthForm"
import GardenGrid from "./components/Garden/GardenGrid"
import { useTimerStore } from "./store/timerStore"

export default function App() {
  const [username, setUsername] = useState(null)
  const sessionCount = useTimerStore((state) => state.sessionCount)

  useEffect(() => {
    const stored = localStorage.getItem("username")
    if (stored) setUsername(stored)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setUsername(null)
  }

  if (!username) {
    return <AuthForm onLogin={setUsername} />
  }

  return (
    <div className="min-h-screen w-full bg-green-50 flex flex-col px-4 py-8">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">🌿 Rootine</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Hi, {username}!</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 underline">Logout</button>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-lg font-semibold">Your Garden</h2>
            <p className="text-sm">Complete focus sessions to unlock new plants.</p>
          </div>

          <div className="w-full flex flex-col lg:flex-row gap-10 items-center">
            <div className="bg-white rounded-2xl shadow-md p-10 flex justify-center">
              <TimerDisplay />
            </div>
          <div className="flex-1 w-full">
            <GardenGrid sessionCount={sessionCount} />
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}