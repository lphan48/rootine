export default function GardenGrid({ activePlant, isLoading }) {
  const formattedStage = activePlant?.stage ? activePlant.stage.replace('_', ' ') : ''
  const unlockedLabel = activePlant?.unlocked_at
    ? new Date(activePlant.unlocked_at).toLocaleString()
    : 'Unknown'

  return (
    <div className="flex flex-col gap-4 ml-20">
      <div>
        <div className="relative w-full max-w-[40rem] mx-auto aspect-[5/4]">
          <div className="absolute inset-0 [perspective:1000px]">
            <div
              className="h-full w-full grid grid-cols-5 gap-2 rounded-xl border-2 border-amber-900 bg-amber-700 p-3 shadow-inner"
              style={{ transform: 'rotateX(58deg)', transformOrigin: 'center bottom' }}
            >
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={`soil-${index}`}
                  className="rounded-md border border-amber-900/70 bg-amber-800 shadow-inner"
                />
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading plant...</p>
              ) : activePlant?.image_url ? (
                <div className="relative group">
                  <img
                    src={activePlant.image_url}
                    alt={`${activePlant.plant_type_name} ${activePlant.stage}`}
                    className="w-28 h-28 object-contain drop-shadow-md"
                  />
                  <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-white/95 border border-gray-200 px-3 py-2 text-xs text-gray-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="font-semibold text-gray-800">{activePlant.plant_type_name}</p>
                    <p>Stage: {formattedStage}</p>
                    <p>Unlocked: {unlockedLabel}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active plant yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
