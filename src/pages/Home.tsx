import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BLE from "../components/ble";

export default function Home() {
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isBleOpen, setIsBleOpen] = useState(false);

  const levels = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const saved = localStorage.getItem("unlockedLevel");
    if (saved) {
      setUnlockedLevel(Number(saved));
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem("unlockedLevel");
      if (updated) {
        setUnlockedLevel(Number(updated));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleReset = () => {
    localStorage.clear();
    setUnlockedLevel(1);
    alert("Progress berhasil direset!");
  };

  if (!isLandscape) {
    return (
      <div className="bg-purple-600 h-screen flex items-center justify-center">
        <h1 className="text-white text-center text-xl font-bold px-6">
          Please rotate, untuk pindah ke mode landscape dan aplikasi dapat digunakan
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-purple-600 h-screen flex flex-col items-center justify-start px-4 py-6 overflow-hidden">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">
        WELCOME TO DISSOLVE
      </h1>

      {/* Button BLE + Reset */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setIsBleOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          🔍 Scan BLE
        </button>
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
        >
          ♻️ Reset Progress
        </button>
      </div>

      {/* Level cards */}
      <div className="flex overflow-x-auto gap-4 w-full px-4 snap-x snap-mandatory">
        {levels.map((lvl) => (
          <div
            key={lvl}
            className="min-w-[160px] min-h-[12rem] bg-amber-50 flex items-center justify-center rounded-lg shadow-md snap-start"
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

      {/* Modal BLE dengan Backdrop */}
      {isBleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 🔑 Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setIsBleOpen(false)}
          />

          {/* 🔑 Modal Box */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md animate-fadeInScale">
            <button
              onClick={() => setIsBleOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-lg font-bold mb-4">Bluetooth Scan</h2>
            <BLE />
          </div>
        </div>
      )}
    </div>
  );
}
