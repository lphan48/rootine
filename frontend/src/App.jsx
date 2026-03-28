import { useState, useEffect } from "react"
import TimerDisplay from "./components/Timer/TimerDisplay"
import AuthForm from "./components/Auth/AuthForm"
import GardenGrid from "./components/Garden/GardenGrid"
import Navbar from "./components/Navbar"
import { useTimerStore } from "./store/timerStore"
import PlantsTab from "./components/Plants/PlantsTab"
import { getActivePlant, getPlantTypes } from "./api/plants"
import { getProfileStats } from "./api/profile"

export default function App() {
  const tabs = ["garden", "plants"]
  const [username, setUsername] = useState(null)
  const [activeTab, setActiveTab] = useState("garden")
  const [plants, setPlants] = useState([])
  const [plantTypes, setPlantTypes] = useState([])
  const [accountXp, setAccountXp] = useState(0)
  const [profileStats, setProfileStats] = useState(null)
  const [plantLoading, setPlantLoading] = useState(false)
  const [plantTypesLoading, setPlantTypesLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
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
    setPlantTypes([])
    setAccountXp(0)
    setProfileStats(null)
  }

  useEffect(() => {
    if (!username) return

    let cancelled = false
    const fetchUserData = async () => {
      try {
        setPlantLoading(true)
        setPlantTypesLoading(true)
        setProfileLoading(true)

        const [plantsResponse, plantTypesResponse, profileResponse] = await Promise.all([
          getActivePlant(),
          getPlantTypes(),
          getProfileStats(),
        ])

        if (!cancelled) {
          setPlants(plantsResponse.data.plants || [])
          setPlantTypes(plantTypesResponse.data.plant_types || [])
          setAccountXp(plantTypesResponse.data.account_xp || 0)
          setProfileStats(profileResponse.data || null)
        }
      } catch (error) {
        if (!cancelled) {
          setPlants([])
          setPlantTypes([])
          setAccountXp(0)
          setProfileStats(null)
        }
      } finally {
        if (!cancelled) {
          setPlantLoading(false)
          setPlantTypesLoading(false)
          setProfileLoading(false)
        }
      }
    }

    fetchUserData()
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
        profileStats={profileStats}
        profileLoading={profileLoading}
        onLogout={handleLogout}
      />

      <div className="flex-1 w-full flex items-start justify-center px-4 mt-20">
        {activeTab === "garden" ? (
          <div className="w-full max-w-6xl flex flex-col gap-6 items-center">
            <div className="garden-intro-entrance mb-10 w-full max-w-2xl rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4 text-center shadow-sm">
              <h2 className="mt-1 text-2xl font-extrabold text-emerald-900">Your Garden</h2>
              <p className="mt-1 text-sm font-medium text-emerald-800">Complete focus sessions to unlock new plants.</p>
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
          <PlantsTab
            plantTypes={plantTypes}
            accountXp={accountXp}
            isLoading={plantTypesLoading}
          />
        ) : null}
      </div>
    </div>
  )
}