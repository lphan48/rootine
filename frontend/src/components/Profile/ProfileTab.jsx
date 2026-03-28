export default function ProfileTab({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl bg-white rounded-2xl border border-mist shadow-md p-10 text-center text-black/60">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl border border-mist shadow-md p-10">
      <h2 className="text-lg font-semibold text-black/85 mb-4">Profile</h2>
      <div className="space-y-2 text-black/75">
        <p><span className="font-medium">Sessions Completed:</span> {stats?.sessions_completed ?? 0}</p>
        <p><span className="font-medium">Total XP:</span> {stats?.total_xp ?? 0}</p>
      </div>
    </div>
  )
}
