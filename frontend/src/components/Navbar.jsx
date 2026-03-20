export default function Navbar({ tabs, activeTab, onTabChange, username, onLogout }) {
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

        <div className="flex items-center gap-3 px-2">
          <span className="text-sm text-gray-500">Hi, {username}!</span>
          <button onClick={onLogout} className="text-xs text-gray-400 underline">Logout</button>
        </div>
      </div>
    </nav>
  )
}
