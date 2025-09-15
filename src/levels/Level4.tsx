import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const COMBINATIONS = [
  "saya", "bude", "kaki", "padi", "bapa"
]

export const Level4 = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level4_index")
    if (saved) setIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (index < COMBINATIONS.length - 1) {
      const next = index + 1
      setIndex(next)
      localStorage.setItem("level4_index", String(next))
    } else {
      // selesai → unlock Level 4
      localStorage.setItem("unlockedLevel", "5")
      navigate("/level5")
    }
  }

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]
  const third = pair[2]
  const fourth = pair[3]

  return (
    <div className="containerLv1">
      <div className="titleBox">
        Level 4 — Kombinasi Khusus
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
            ) : idx === 3 ? (
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{fourth}</span>
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
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "4")
              if (unlockedLevel < 2) {
                localStorage.setItem("unlockedLevel", "5")
              }
              navigate("/level5")
            }}
          >
            ➡️ Lanjut Level 5
          </button>
        </div>
      )}
    </div>
  )
}
