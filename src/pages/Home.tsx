import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBLE } from "../components/BLEContext";

export default function Home() {
  const { isConnected, connect, disconnect } = useBLE();
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isConnecting, setIsConnecting] = useState(false);
  const levels = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const saved = localStorage.getItem("unlockedLevel");
    if (saved) setUnlockedLevel(Number(saved));

    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReset = () => {
    localStorage.clear();
    setUnlockedLevel(1);
    alert("Progress berhasil direset!");
  };

  const handleScan = async () => {
    try {
      setIsConnecting(true);
      await connect();
      alert("✅ BLE berhasil terhubung!");
    } catch (err) {
      console.error("Gagal konek BLE:", err);
      alert("❌ Gagal konek BLE!");
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isLandscape) {
    return (
      <div className="bg-purple-600 h-screen flex items-center justify-center">
        <h1 className="text-white text-center text-xl font-bold px-6">
          Please rotate ke mode landscape
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-purple-600 h-screen flex flex-col items-center justify-start px-4 py-6 overflow-hidden">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">
        WELCOME TO DISSOLVE
      </h1>

      {/* Tombol BLE dan Reset */}
      <div className="mb-6 flex gap-4">
        <button
          disabled={isConnecting || isConnected}
          onClick={handleScan}
          className={`px-4 py-2 rounded-lg shadow transition ${
            isConnected
              ? "bg-green-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isConnecting
            ? "⏳ Scanning..."
            : isConnected
            ? "✅ Connected"
            : "🔍 Scan BLE"}
        </button>

        {isConnected && (
          <button
            onClick={disconnect}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition"
          >
            ❌ Disconnect
          </button>
        )}

        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
        >
          ♻️ Reset Progress
        </button>
      </div>

      {/* Status koneksi */}
      <p className="text-white mb-4">
        Status BLE:{" "}
        <b>{isConnected ? "✅ Terhubung" : "❌ Belum Terhubung"}</b>
      </p>

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
    </div>
  );
}
