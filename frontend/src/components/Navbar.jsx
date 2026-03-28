export default function Navbar({
  tabs,
  activeTab,
  onTabChange,
  username,
  profileStats,
  profileLoading,
  onLogout,
}) {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-green-700 px-2">🌿 Rootine</h1>

        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-green-100 text-green-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-3 px-2">
          <div className="relative group">
            <span className="text-sm text-gray-500 cursor-default">Hi, {username}!</span>

            <div className="pointer-events-none absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Profile Stats</h3>

              {profileLoading ? (
                <p className="text-sm text-gray-500">Loading profile...</p>
              ) : (
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Sessions Completed:</span>{" "}
                    {profileStats?.sessions_completed ?? 0}
                  </p>
                  <p>
                    <span className="font-medium">Total XP:</span> {profileStats?.total_xp ?? 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button onClick={onLogout} className="text-xs text-gray-400 underline">Logout</button>
        </div>
      </div>
    </nav>
  )
}
