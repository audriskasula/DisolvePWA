import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("")

export const Level1 = () => {
  const [charIndex, setCharIndex] = useState(0) // 0 = 'a'
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level1_sub1_charIndex")
    if (saved !== null) setCharIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (charIndex < ALPHABET.length - 1) {
      const next = charIndex + 1
      setCharIndex(next)
      localStorage.setItem("level1_index", String(next))
    } else {
      // selesai 'z' -> buka sublevel2
      localStorage.setItem("unlockedLevel", "2")
      navigate("/level2")
    }
  }

  
  return (
    <div className="containerLv1">
      <div className="titleBox">
        Tempelkan 1 Huruf Seperti Pada Gambar
      </div>

      {/* Selalu 6 kotak, hanya kotak pertama yang terpakai */}
      <div className="board">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            {i === 0 ? (
              <div className="slot filled" onClick={handleAdvance}>
                <span className="letter">{ALPHABET[charIndex]}</span>
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      <div className="info">
        Huruf saat ini: <b>{ALPHABET[charIndex]}</b> — klik kotak hijau untuk lanjut
      </div>

      {charIndex === 4 && (
        <div className="buttons">
          <button onClick={() => navigate("/")}>🏠 Kembali ke Home</button>
          <button
            onClick={() => {
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "1")
              if (unlockedLevel < 2) {
                localStorage.setItem("unlockedLevel", "2")
              }
              navigate("/level2")
            }}
          >
            ➡️ Lanjut Level 2
          </button>
        </div>
      )}
    </div>
  )
}
