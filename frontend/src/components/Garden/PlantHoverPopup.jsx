export default function PlantHoverPopup({ plant }) {
  const formattedStage = plant.stage ? plant.stage.replace("_", " ") : ""
  const unlockedLabel = plant.unlocked_at
    ? new Date(plant.unlocked_at).toLocaleString()
    : "Unknown"
  const growthPercent = plant.growth_target_xp
    ? Math.min(100, Math.round((plant.plant_xp / plant.growth_target_xp) * 100))
    : 0

  return (
    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-white/95 border border-gray-200 px-3 py-2 text-xs text-gray-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999]">
      <p className="font-semibold text-gray-800">{plant.plant_type_name}</p>
      <p>Stage: {formattedStage}</p>
      <p>Unlocked: {unlockedLabel}</p>
      {plant.is_active ? (
        <div className="mt-2">
          <p className="mb-1">{growthPercent}% grown</p>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-green-400 rounded"
              style={{ width: `${growthPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
