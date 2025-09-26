import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BLE from "../components/ble"
import "./CSS/level1.css"

const COMBINATIONS = [
  "ba", "ef", "cb", "ae", "ea"
]

export const Level2 = () => {
  const [index, setIndex] = useState(0)
  const [bleData, setBleData] = useState("")
  const [sendFn, setSendFn] = useState<((msg: string) => Promise<void>) | null>(null)
  const [bleReady, setBleReady] = useState(false)

  const [waitingReset, setWaitingReset] = useState(false)
  const [nextCombo, setNextCombo] = useState<string | null>(null)
  const [slotCleared, setSlotCleared] = useState(false)

  const navigate = useNavigate()

  // 🔹 Load progress dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("level2_index")
    if (saved !== null) setIndex(Number(saved))
  }, [])

  // 🔹 Handle data masuk dari BLE
  useEffect(() => {
    if (!bleData) return
    // const expected = COMBINATIONS[index]

    if (bleData.startsWith("CORRECT:")) {
      console.log("✅ Kombinasi benar:", bleData)

      if (index < COMBINATIONS.length - 1) {
        setWaitingReset(true)
        setNextCombo(COMBINATIONS[index + 1])
      } else {
        localStorage.setItem("unlockedLevel", "3")
        navigate("/level3")
      }
      return
    }

    if (bleData.startsWith("WRONG:")) {
      console.log("❌ Kombinasi salah:", bleData)
      return
    }

    if (bleData.startsWith("VICTORY")) {
      console.log("🎉 Puzzle Level 2 selesai!")
    }
  }, [bleData, index, navigate])

  // 🔹 Kirim kombinasi / RESET
  useEffect(() => {
    if (!bleReady || !sendFn) return

    (async () => {
      try {
        if (waitingReset && nextCombo) {
          console.log("📤 Kirim RESET sebelum kombinasi berikutnya")
          await sendFn("RESET")

          setSlotCleared(true)

          await new Promise(resolve => setTimeout(resolve, 400))
          setWaitingReset(false)

          console.log("📤 Kirim kombinasi:", nextCombo)
          await sendFn(nextCombo)

          const nextIndex = index + 1
          setIndex(nextIndex)
          localStorage.setItem("level2_index", String(nextIndex))

          setNextCombo(null)
          setSlotCleared(false)
          return
        }

        if (!waitingReset && index < COMBINATIONS.length && nextCombo === null) {
          const currentCombo = COMBINATIONS[index]
          console.log("📤 Kirim kombinasi:", currentCombo)
          await sendFn(currentCombo)
        }
      } catch (err) {
        console.error("❌ Gagal kirim:", err)
      }
    })()
  }, [bleReady, sendFn, index, waitingReset, nextCombo])

  const pair = COMBINATIONS[index]
  const first = pair[0]
  const second = pair[1]

  return (
    <div className="containerLv1">
      <div className="titleBox">Level 2 — Kombinasi Khusus</div>

      <div className="board">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx}>
            {idx === 0 ? (
              <div className="slot filled">
                {!slotCleared && <span className="letter">{first}</span>}
              </div>
            ) : idx === 1 ? (
              <div className="slot filled">
                {!slotCleared && <span className="letter">{second}</span>}
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      <div className="info">
        Kombinasi saat ini:{" "}
        <b>
          {COMBINATIONS[index]} ({index + 1}/{COMBINATIONS.length})
        </b>
      </div>

      <BLE
        onData={setBleData}
        onReady={(fn) => {
          setSendFn(() => fn)
          setBleReady(true)
        }}
      />
    </div>
  )
}
