const PLANTS = [
  { name: 'Sprout', icon: '🌱', unlockAt: 1 },
  { name: 'Bamboo', icon: '🎋', unlockAt: 2 },
  { name: 'Clover', icon: '☘️', unlockAt: 3 },
  { name: 'Cactus', icon: '🌵', unlockAt: 4 },
  { name: 'Tulip', icon: '🌷', unlockAt: 5 },
  { name: 'Herb', icon: '🌿', unlockAt: 6 },
  { name: 'Maple', icon: '🍁', unlockAt: 8 },
  { name: 'Blossom', icon: '🌸', unlockAt: 10 },
  { name: 'Sunflower', icon: '🌻', unlockAt: 12 },
  { name: 'Palm', icon: '🌴', unlockAt: 14 },
  { name: 'Bouquet', icon: '💐', unlockAt: 16 },
  { name: 'Evergreen', icon: '🌲', unlockAt: 20 },
]

const GRID_COLS = 5
const GRID_ROWS = 4
const TOTAL_PLOTS = GRID_COLS * GRID_ROWS

export default function GardenGrid({ sessionCount }) {
  return (
    <div className="flex flex-col gap-4 ml-20">
      <div>
        <div className="relative w-full max-w-[40rem] mx-auto aspect-[5/4]">
          <div className="absolute inset-0 [perspective:1000px]">
            <div
              className="h-full w-full grid grid-cols-5 gap-2 rounded-xl border-2 border-amber-900 bg-amber-700 p-3 shadow-inner"
              style={{ transform: 'rotateX(58deg)', transformOrigin: 'center bottom' }}
            >
              {Array.from({ length: TOTAL_PLOTS }).map((_, index) => {
                const plant = PLANTS[index]
                const unlocked = plant ? sessionCount >= plant.unlockAt : false

                return (
                  <div
                    key={`soil-${index}`}
                    className={`rounded-md border border-amber-900/70 shadow-inner ${
                      unlocked ? 'bg-amber-800' : 'bg-amber-900/90'
                    }`}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
