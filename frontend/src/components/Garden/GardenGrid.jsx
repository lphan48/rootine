import { useRef, useState, useEffect } from "react"
import PlantPlacementLayer from "./PlantPlacementLayer"

const TOTAL_PLOTS = 20
const GARDEN_TILT_DEG = 58

export default function GardenGrid({ plants = [], isLoading }) {
  const wrapperRef = useRef(null)
  const cellRefs = useRef([])
  const [positions, setPositions] = useState([])

  useEffect(() => {
    function recalc() {
      if (!wrapperRef.current) return
      const wrapperRect = wrapperRef.current.getBoundingClientRect()

      const next = cellRefs.current.map((cell) => {
        if (!cell) return { x: 0, y: 0 }
        const r = cell.getBoundingClientRect()
        return {
          x: r.left - wrapperRect.left + r.width / 2,
          y: r.top  - wrapperRect.top  + r.height * 0.8,
        }
      })
      setPositions(next)
    }

    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [])

  return (
    <div className="flex flex-col gap-4 ml-20">
      <div>
        <div ref={wrapperRef} className="relative w-full max-w-[40rem] mx-auto aspect-[5/4]">
          <div className="absolute inset-0 [perspective:1000px]">
            <div
              className="h-full w-full grid grid-cols-5 gap-2 rounded-xl border-2 border-amber-800 bg-amber-600 p-3 shadow-inner"
              style={{
                transform: `rotateX(${GARDEN_TILT_DEG}deg)`,
                transformOrigin: "center bottom",
              }}
            >
              {Array.from({ length: TOTAL_PLOTS }).map((_, index) => (
                <div
                  key={`soil-${index}`}
                  ref={(el) => { cellRefs.current[index] = el }}
                  className="rounded-md border border-amber-800/70 bg-amber-700 shadow-inner"
                />
              ))}
            </div>
          </div>

          <PlantPlacementLayer plants={plants} positions={positions} />
        </div>

        {isLoading ? <p className="text-sm text-gray-500 mt-3">Loading plants...</p> : null}
      </div>
    </div>
  )
}