import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/level1.css"

const COMBINATIONS = [
  "ba","bi","bu","be","bo",
  "ca","ci","cu","ce","co",
  "da","di","du","de","do",
  "fa","fi","fu","fe","fo",
  "ga","gi","gu","ge","go",
  "ha","hi","hu","he","ho",
  "ja","ji","ju","je","jo",
  "ka","ki","ku","ke","ko",
  "la","li","lu","le","lo",
  "ma","mi","mu","me","mo",
  "na","ni","nu","ne","no",
  "pa","pi","pu","pe","po",
  "qa","qi","qu","qe","qo",
  "ra","ri","ru","re","ro",
  "ta","ti","tu","te","to",
  "va","vi","vu","ve","vo",
  "wa","wi","wu","we","wo",
  "xa","xi","xu","xe","xo",
  "ya","yi","yu","ye","yo",
  "za","zi","zu","ze","zo"
]

export const Level2 = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("level1_sub2_index")
    if (saved) setIndex(Number(saved))
  }, [])

  const handleAdvance = () => {
    if (index < COMBINATIONS.length - 1) {
      const next = index + 1
      setIndex(next)
      localStorage.setItem("level1_sub2_index", String(next))
    } else {
      // selesai → unlock Level 2
      localStorage.setItem("unlockedLevel", "2")
      navigate("/")
    }
  }

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]

  return (
    <div className="containerLv1">
      <div className="titleBox">
        Sublevel 2 — Kombinasi Khusus
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
        Kombinasi saat ini: <b>{pair}</b> ({index + 1}/{COMBINATIONS.length})
      </div>
    </div>
  )
}
