export default function PlantHoverPopup({ plant }) {
  const formattedStage = plant.stage ? plant.stage.replace("_", " ") : ""
  const unlockedLabel = plant.unlocked_at
    ? new Date(plant.unlocked_at).toLocaleString()
    : "Unknown"

  return (
    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-white/95 border border-gray-200 px-3 py-2 text-xs text-gray-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999]">
      <p className="font-semibold text-gray-800">{plant.plant_type_name}</p>
      <p>Stage: {formattedStage}</p>
      <p>Unlocked: {unlockedLabel}</p>
    </div>
  )
}
