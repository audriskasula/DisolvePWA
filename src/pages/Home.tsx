import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BLE from "../components/ble";

export default function Home() {
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

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

    // cek orientasi saat resize
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

      {/* Tambahkan BLE component di halaman Home */}
      <div className="mb-6 flex justify-center">
        <BLE />
      </div>

      {/* Level cards */}
      <div className="flex justify-center overflow-x-auto gap-4 w-full px-4">
        {levels.map((lvl) => (
          <div
            key={lvl}
            className="min-w-[160px] min-h-[12rem] bg-amber-50 flex items-center justify-center rounded-lg shadow-md"
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
