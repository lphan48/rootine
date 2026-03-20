import { useState, useEffect } from "react"
import TimerDisplay from "./components/Timer/TimerDisplay"
import AuthForm from "./components/Auth/AuthForm"
import GardenGrid from "./components/Garden/GardenGrid"
import Navbar from "./components/Navbar"
import { useTimerStore } from "./store/timerStore"
import { getActivePlant } from "./api/plants"

export default function App() {
  const tabs = ["garden", "plants", "profile"]
  const [username, setUsername] = useState(null)
  const [activeTab, setActiveTab] = useState("garden")
  const [plants, setPlants] = useState([])
  const [plantLoading, setPlantLoading] = useState(false)
  const sessionCount = useTimerStore((state) => state.sessionCount)

  useEffect(() => {
    const stored = localStorage.getItem("username")
    if (stored) setUsername(stored)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setUsername(null)
    setActiveTab("garden")
    setPlants([])
  }

  useEffect(() => {
    if (!username) return

    let cancelled = false
    const fetchUserPlants = async () => {
      try {
        setPlantLoading(true)
        const response = await getActivePlant()
        if (!cancelled) {
          setPlants(response.data.plants || [])
        }
      } catch (error) {
        if (!cancelled) {
          setPlants([])
        }
      } finally {
        if (!cancelled) {
          setPlantLoading(false)
        }
      }
    }

    fetchUserPlants()
    return () => {
      cancelled = true
    }
  }, [username, sessionCount])

  if (!username) {
    return <AuthForm onLogin={setUsername} />
  }

  return (
    <div className="min-h-screen w-full bg-green-50 flex flex-col">
      <Navbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        username={username}
        onLogout={handleLogout}
      />

      <div className="flex-1 w-full flex items-center justify-center mt-6 px-4">
        {activeTab === "garden" ? (
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
                <GardenGrid plants={plants} isLoading={plantLoading} />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "plants" ? (
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
            Plants page coming soon.
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
            Profile page coming soon.
          </div>
        ) : null}
      </div>
    </div>
  )
}