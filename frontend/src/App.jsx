import { useState, useEffect } from "react"
import TimerDisplay from "./components/Timer/TimerDisplay"
import AuthForm from "./components/Auth/AuthForm"

export default function App() {
  const [username, setUsername] = useState(null)

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
    <div className="min-h-screen w-full bg-green-50 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm px-4">
        <h1 className="text-xl font-bold text-green-700">🌿 Rootine</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Hi, {username}!</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 underline">Logout</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-10">
        <TimerDisplay />
      </div>
    </div>
  )
}