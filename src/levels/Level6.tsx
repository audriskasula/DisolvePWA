import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BLE from "../components/ble"
import "./CSS/level1.css"

const COMBINATIONS = [
  "berani", "rambut", "tangis", "abidin", "berdoa"
]

export const Level6 = () => {
  const [index, setIndex] = useState(0)
  const [bleData, setBleData] = useState("");
  const [sendFn, setSendFn] = useState<((msg: string) => Promise<void>) | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level6_index")
    if (saved) setIndex(Number(saved))
  }, [])

  useEffect(() => {
    if (!bleData) return;
    const expected = COMBINATIONS[index];
    if (bleData.toLowerCase() === expected.toLowerCase() && bleData.length === expected.length) {
      if (index < COMBINATIONS.length - 1) {
        const next = index + 1
        setIndex(next)
        localStorage.setItem("level6_index", String(next))
      } else {
        localStorage.setItem("unlockedLevel", "6")
        navigate("/")
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
  const third = pair[2]
  const fourth = pair[3]
  const fifth = pair[4]
  const sixth = pair[5]

  return (
    <div className="containerLv6">
      <div className="titleBox">
        Level 6 — Kata Sederhana
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
            ) : idx === 2 ? (
              <div className="slot filled">
                <span className="letter">{third}</span>
              </div>
            ) : idx === 3 ? (
              <div className="slot filled">
                <span className="letter">{fourth}</span>
              </div>
            ) : idx === 4 ? (
              <div className="slot filled">
                <span className="letter">{fifth}</span>
              </div>
            ) : idx === 5 ? (
              <div className="slot filled">
                <span className="letter">{sixth}</span>
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
