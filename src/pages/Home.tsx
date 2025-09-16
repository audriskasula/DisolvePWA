import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import BLE from "../components/ble";

export default function Home() {
  const [unlockedLevel, setUnlockedLevel] = useState(1)
  const levels = [1, 2, 3, 4, 5, 6]

  useEffect(() => {
    const saved = localStorage.getItem("unlockedLevel")
    if (saved) {
      setUnlockedLevel(Number(saved))
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem("unlockedLevel")
      if (updated) {
        setUnlockedLevel(Number(updated))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <div className="background px-20 py-5">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">
        WELCOME TO DISSOLVE
      </h1>

      {/* Tambahkan BLE component di halaman Home */}
      <div className="mb-6 flex justify-center">
        <BLE />
      </div>

      {/* Wrapper scroll untuk level */}
      <div className="flex justify-center overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
        {levels.map((lvl) => (
          <div
            key={lvl}
            className="min-w-[200px] h-80 bg-amber-50 flex items-center justify-center rounded-lg shadow-md"
          >
            {lvl <= unlockedLevel ? (
              <Link
                to={`/level${lvl}`}
                className="text-xl font-bold text-blue-600"
              >
                Level {lvl}
              </Link>
            ) : (
              <div className="text-gray-500 text-lg">🔒 Locked</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
