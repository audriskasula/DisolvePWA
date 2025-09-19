import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const COMBINATIONS = [
  "berani", "rambut", "tangis", "abidin", "berdoa"
]

export const Level6 = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level6_index")
    if (saved) setIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (index < COMBINATIONS.length - 1) {
      const next = index + 1
      setIndex(next)
      localStorage.setItem("level6_index", String(next))
    } else {
      // selesai → unlock Level 4
      localStorage.setItem("unlockedLevel", "6")
      navigate("/")
    }
  }

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]
  const third = pair[2]
  const fourth = pair[3]
  const fifth = pair[4]
  const sixth = pair[5]

  return (
    <div className="containerLv1">
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
            ) : idx === 4 ? (
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{fifth}</span>
              </div>
            ) : idx === 5 ? (
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{sixth}</span>
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      <div className="info">
        Kata saat ini: <b>{COMBINATIONS[index]}  ({index + 1}/{COMBINATIONS.length})</b> — klik kotak hijau untuk lanjut
      </div>

      {index === 4 && (
        <div className="buttons">
          <button onClick={() => navigate("/")}>🏠 Kembali ke Home</button>
          <button
            onClick={() => {
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "6")
              if (unlockedLevel < 7) {
                localStorage.setItem("unlockedLevel", "6")
              }
              navigate("/")
            }}
          >
            ➡️ Selesai
          </button>
        </div>
      )}
    </div>
  )
}
