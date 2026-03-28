export default function PlantHoverPopup({ plant }) {
  const plantTypeKey = (plant.plant_type_key || plant.plant_type_name || "").toLowerCase()
  const plantTypeColorMap = {
    cactus: "#4ba750",
    sunflower: "#F9A825",
    tomato: "#D84315",
  }
  const accentColor =
    Object.entries(plantTypeColorMap).find(([key]) => plantTypeKey.includes(key))?.[1] || "#6B7280"

  const formattedStage = plant.stage
    ? plant.stage
        .replaceAll("_", " ")
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : ""
  const unlockedLabel = plant.unlocked_at
    ? new Date(plant.unlocked_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown"
  const growthPercent = plant.growth_target_xp
    ? Math.min(100, Math.round((plant.plant_xp / plant.growth_target_xp) * 100))
    : 0

  return (
    <div
      className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-white border-2 px-3 py-2 text-sm text-gray-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-[9999] w-60 h-30 flex flex-col"
      style={{ borderColor: accentColor }}
    >
      <p className="self-center text-center font-semibold text-base truncate" style={{ color: accentColor }}>
        {plant.plant_type_name}
      </p>
      <p className="truncate"><span className="font-semibold">Stage:</span> {formattedStage}</p>
      <p className="truncate"><span className="font-semibold">Unlocked:</span> {unlockedLabel}</p>
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
      ) : <div className="mt-auto" />}
    </div>
  )
}
