import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BLE from "../components/ble"
import "./CSS/level1.css"

const COMBINATIONS = [
  "bd", "pq", "wm", "ad", "bp"
]

export const Level2 = () => {
  const [index, setIndex] = useState(0)
  const [bleData, setBleData] = useState("");
  const [sendFn, setSendFn] = useState<((msg: string) => Promise<void>) | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level2_index")
    if (saved) setIndex(Number(saved))
  }, [])

  useEffect(() => {
    if (!bleData) return;
    const expected = COMBINATIONS[index];

    // pastikan data sesuai panjang (2 huruf)
    if (bleData.toLowerCase() === expected.toLowerCase() && bleData.length === expected.length) {
      if (index < COMBINATIONS.length - 1) {
        const next = index + 1;
        setIndex(next);
        localStorage.setItem("level2_index", String(next));
      } else {
        localStorage.setItem("unlockedLevel", "3");
        navigate("/level3");
      }
    }
  }, [bleData]);


  useEffect(() => {
    if (sendFn) {
      const currentLetter = COMBINATIONS[index];
      sendFn(currentLetter); // ⬅️ langsung kirim huruf otomatis
    }
  }, [sendFn, index]);

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]

  return (
    <div className="containerLv2">
      <div className="titleBox">
        Level 2 — Kombinasi Khusus
      </div>

      <div className="board">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx}>
            {idx === 0 ? (
              <div className="slot filled">
                <span className="letter">{first}</span>
              </div>
            ) : idx === 1 ? (
              <div className="slot filled">
                <span className="letter">{second}</span>
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      <div className="info">
        Huruf saat ini:{" "}
        <b>
          {COMBINATIONS[index]} ({index + 1}/{COMBINATIONS.length})
        </b>
      </div>

      {/* Komponen BLE */}
      <BLE onData={setBleData} onReady={setSendFn} />
    </div>
  )
}
