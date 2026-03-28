import PlantHoverPopup from "./PlantHoverPopup"

const TOTAL_PLOTS = 20

function hashString(value) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % TOTAL_PLOTS
  }
  return hash
}

function mapPlantsToPlots(plants) {
  const used = new Set()
  const placement = new Map()

  for (const plant of plants) {
    let slot = hashString(plant.plant_id)
    let attempts = 0

    while (used.has(slot) && attempts < TOTAL_PLOTS) {
      slot = (slot + 1) % TOTAL_PLOTS
      attempts += 1
    }

    if (!used.has(slot)) {
      used.add(slot)
      placement.set(slot, plant)
    }
  }

  return placement
}

export default function PlantPlacementLayer({ plants = [], positions = [] }) {
  const plantsByPlot = mapPlantsToPlots(plants)

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {positions.map((pos, index) => {
        const plant = plantsByPlot.get(index)
        if (!plant) return null

        return (
          <div
            key={`plant-${index}`}
            className="absolute pointer-events-auto z-10 hover:z-50"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="relative group">
              <img
                src={`${plant.image_url}?v=3`}
                alt={`${plant.plant_type_name} ${plant.stage}`}
                className="block drop-shadow-md max-w-none"
              />
              <PlantHoverPopup plant={plant} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
