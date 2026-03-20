export default function PlantsTab({ plantTypes = [], accountXp = 0, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
        Loading plants...
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4">
      {plantTypes.map((plantType) => {
        const xpToUnlock = Math.max(0, plantType.unlock_account_xp - accountXp)
        const matureAsset = plantType.stage_assets?.mature_plant
        const thresholds = plantType.stage_thresholds || {}

        return (
          <div key={plantType.plant_type_id} className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center gap-4">
              <img
                src={`${matureAsset?.image_url || ''}?v=2`}
                alt={`${plantType.name} mature stage`}
                className="w-20 h-20 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{plantType.name}</h3>
                <p className="text-sm text-gray-500">
                  {plantType.is_unlocked ? 'Unlocked' : `Locked • Need ${xpToUnlock} more XP`}
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Seed:</span> {thresholds.seed ?? 0} XP</p>
              <p><span className="font-medium">Sprout:</span> {thresholds.sprout ?? 100} XP</p>
              <p><span className="font-medium">Small Plant:</span> {thresholds.small_plant ?? 250} XP</p>
              <p><span className="font-medium">Mature Plant:</span> {thresholds.mature_plant ?? plantType.growth_target_xp} XP</p>
              <p><span className="font-medium">Unlock Requirement:</span> {plantType.unlock_account_xp} total XP</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
