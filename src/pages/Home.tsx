import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBLE } from "../components/BLEContext";
import "../levels/CSS/level.css";

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
      <div className="containerLv1">
        <h1 className="text-white text-center text-xl font-bold px-6">
          📱 Silakan rotasi ke mode landscape
        </h1>
      </div>
    );
  }

  return (
    <div className="containerLv1">
      <div className="level1-wrapper animate-fadeInScale">
        <div className="titleBox">Welcome to Dissolve</div>



        <div className="flex justify-center gap-3 my-4">
          <button
            disabled={isConnecting || isConnected}
            onClick={handleScan}
            className={`px-4 py-2 rounded-lg font-semibold text-white shadow transition ${isConnected
              ? "bg-green-500"
              : "bg-indigo-500 hover:bg-indigo-600"
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
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow"
            >
              ❌ Disconnect
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow"
          >
            ♻️ Reset Progress
          </button>
        </div>

        <div
          className={`status ${isConnected ? "ready" : "sending"
            }`}
        >
          {isConnected ? "✅ BLE Terhubung" : "🔌 Menunggu Koneksi..."}
        </div>

        <div className="board">
          {levels.map((lvl) => (
            lvl <= unlockedLevel ? (
              <Link
                key={lvl}
                to={`/level${lvl}`}
                className="slot letter filled"
              >
                {lvl}
              </Link>
            ) : (
              <div key={lvl} className="slot letter">
                <span className="letter">🔒</span>
              </div>
            )
          ))}
        </div>

      </div>
    </div>
  );
}
