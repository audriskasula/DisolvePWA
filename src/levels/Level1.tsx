// Level1.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BLE from "../components/ble";
import "./CSS/level1.css";

const ALPHABET = "abcfe".split("");

export const Level1 = () => {
  const [charIndex, setCharIndex] = useState(0);
  const [bleData, setBleData] = useState("");
  const [sendFn, setSendFn] = useState<((msg: string) => Promise<void>) | null>(null);
  const [bleReady, setBleReady] = useState(false);

  const [waitingReset, setWaitingReset] = useState(false);
  const [nextLetter, setNextLetter] = useState<string | null>(null);
  const [slotCleared, setSlotCleared] = useState(false); // 🔹 untuk UI slot
  const navigate = useNavigate();

  // 🔹 Load progress dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("level1_index");
    if (saved !== null) setCharIndex(Number(saved));
  }, []);

  // 🔹 Handle data masuk dari BLE
  useEffect(() => {
    if (!bleData) return;

    if (bleData.startsWith("NEW_PUZZLE:")) {
      console.log("Puzzle dimulai:", bleData);
      return;
    }

    if (bleData.startsWith("CORRECT:")) {
      console.log("Huruf benar:", bleData);

      // Jika bukan huruf terakhir, siapkan reset & huruf berikutnya
      if (charIndex < ALPHABET.length - 1) {
        setWaitingReset(true);
        setNextLetter(ALPHABET[charIndex + 1]);
      } else {
        localStorage.setItem("unlockedLevel", "2");
        navigate("/level2");
      }

      return;
    }

    if (bleData.startsWith("WRONG:")) {
      console.log("Huruf salah:", bleData);
      return;
    }

    if (bleData.startsWith("VICTORY")) {
      console.log("Puzzle selesai!");
    }
  }, [bleData, charIndex, navigate]);

  // 🔹 Kirim huruf / RESET
  useEffect(() => {
    if (!bleReady || !sendFn) return;

    (async () => {
      try {
        if (waitingReset && nextLetter) {
          console.log("📤 Kirim RESET sebelum huruf berikutnya");
          await sendFn("RESET");

          // kosongkan slot dulu
          setSlotCleared(true);

          await new Promise(resolve => setTimeout(resolve, 400)); // delay biar ESP32 siap
          setWaitingReset(false);

          console.log("📤 Kirim huruf:", nextLetter);
          await sendFn(nextLetter);

          // Update index & simpan progress
          const nextIndex = charIndex + 1;
          setCharIndex(nextIndex);
          localStorage.setItem("level1_index", String(nextIndex));

          setNextLetter(null);

          // setelah huruf baru dikirim, tampilkan lagi di slot
          setSlotCleared(false);
          return;
        }

        // 🔹 Saat refresh halaman / pertama kali
        if (!waitingReset && charIndex < ALPHABET.length && nextLetter === null) {
          const currentLetter = ALPHABET[charIndex];
          console.log("📤 Kirim huruf:", currentLetter);
          await sendFn(currentLetter);
        }
      } catch (err) {
        console.error("❌ Gagal kirim:", err);
      }
    })();
  }, [bleReady, sendFn, charIndex, waitingReset, nextLetter]);

  return (
    <div className="containerLv1">
      <div className="titleBox">Tempelkan 1 Huruf Seperti Pada Gambar</div>

      <div className="board">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            {i === 0 ? (
              <div className="slot filled">
                {/* 🔹 Jangan tampilkan huruf kalau slotCleared true */}
                {!slotCleared && <span className="letter">{ALPHABET[charIndex]}</span>}
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
          {ALPHABET[charIndex]} ({charIndex + 1}/{ALPHABET.length})
        </b>
      </div>

      <BLE
        onData={setBleData}
        onReady={(fn) => {
          setSendFn(() => fn);
          setBleReady(true);
        }}
      />
    </div>
  );
};
