import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const COMBINATIONS = [
  "bd", "pq", "wm", "ad", "bp"
]

export const Level2 = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level2_index")
    if (saved) setIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (index < COMBINATIONS.length - 1) {
      const next = index + 1
      setIndex(next)
      localStorage.setItem("level2_index", String(next))
    } else {
      // selesai → unlock Level 3
      localStorage.setItem("unlockedLevel", "3")
      navigate("/level3")
    }
  }

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]

  return (
    <div className="containerLv1">
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
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{second}</span>
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      <div className="info">
        Huruf saat ini: <b>{COMBINATIONS[index]}  ({index+1}/{COMBINATIONS.length})</b> — klik kotak hijau untuk lanjut
      </div>

      {index === 4 && (
        <div className="buttons">
          <button onClick={() => navigate("/")}>🏠 Kembali ke Home</button>
          <button
            onClick={() => {
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "2")
              if (unlockedLevel < 2) {
                localStorage.setItem("unlockedLevel", "3")
              }
              navigate("/level3")
            }}
          >
            ➡️ Lanjut Level 3
          </button>
        </div>
      )}
    </div>
  )
}
