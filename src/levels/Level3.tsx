import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const COMBINATIONS = [
  "api", "ibu", "oke", "elu", "iya"
]

export const Level3 = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level3_index")
    if (saved) setIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (index < COMBINATIONS.length - 1) {
      const next = index + 1
      setIndex(next)
      localStorage.setItem("level3_index", String(next))
    } else {
      // selesai → unlock Level 4
      localStorage.setItem("unlockedLevel", "4")
      navigate("/level4")
    }
  }

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]
  const third = pair[2]

  return (
    <div className="containerLv1">
      <div className="titleBox">
        Level 3 — Kombinasi Khusus
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
            ) : idx === 2 ? (
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{third}</span>
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
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "3")
              if (unlockedLevel < 4) {
                localStorage.setItem("unlockedLevel", "4")
              }
              navigate("/level4")
            }}
          >
            ➡️ Lanjut Level 4
          </button>
        </div>
      )}
    </div>
  )
}
