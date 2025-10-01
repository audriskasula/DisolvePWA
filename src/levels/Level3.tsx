import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level1.css";
import { useBLE } from "../components/BLEContext";

const COMBINATIONS = ["abc", "bfx", "cxa", "xaf", "fcb"];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Level3() {
  const { isConnected, send, subscribe } = useBLE();
  const navigate = useNavigate();

  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("level3_index");
    return saved ? Number(saved) : 0;
  });

  const indexRef = useRef(index);
  const correctSetRef = useRef<Set<string>>(new Set());
  const waitingResetRef = useRef(false);

  useEffect(() => { indexRef.current = index; }, [index]);

  const currentCombo = COMBINATIONS[index];
  const allLetters = currentCombo.split("");

  useEffect(() => {
    console.log("📡 Listener BLE aktif Level3");

    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);

      if (msg.startsWith("CORRECT:")) {
        const letter = msg.split(":").pop()?.trim();
        if (letter && allLetters.includes(letter)) {
          correctSetRef.current.add(letter);
          console.log(`✅ Huruf benar: ${letter}`);

          if (correctSetRef.current.size === allLetters.length) {
            console.log("🎉 Semua huruf benar → kirim RESET");
            waitingResetRef.current = true;
            await delay(2000);
            await send("RESET");
          }
        }
      } else if (msg.startsWith("WRONG")) {
        console.log("❌ Salah → kirim RESET dan ulang");
        waitingResetRef.current = true;
        correctSetRef.current.clear();
        await delay(2000);
        await send("RESET");
      } else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;
          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS.length) {
              setIndex(nextIndex);
              localStorage.setItem("level3_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              const nextCombo = COMBINATIONS[nextIndex];
              console.log(`➡️ Kirim kombinasi: ${nextCombo}`);
              await delay(2000);
              await send(nextCombo);
            } else {
              console.log("🏁 Level3 selesai");
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "4");
              navigate("/level4");
            }
          } else {
            console.log(`↩️ Ulang kombinasi: ${currentCombo}`);
            await delay(2000);
            await send(currentCombo);
          }
        }
      }
    });

    return () => unsub();
  }, [send, subscribe, navigate, currentCombo, allLetters]);

  useEffect(() => {
    if (isConnected) {
      console.log("📶 Kirim pertama:", currentCombo);
      (async () => {
        await delay(2000);
        await send(currentCombo);
      })();
    }
  }, [isConnected, send, currentCombo]);

  return (
    <div className="containerLv1">
      <div className="titleBox">Level 3 — Kombinasi Huruf</div>
      <div className="board">
        {currentCombo.split("").map((l, i) => (
          <div key={i} className="slot filled"><span className="letter">{l}</span></div>
        ))}
        {Array.from({ length: 6 - currentCombo.length }).map((_, i) => (
          <div key={`empty-${i}`} className="slot" />
        ))}
      </div>
      <div className="info">
        Kombinasi saat ini: <b>{currentCombo} ({index + 1}/{COMBINATIONS.length})</b>
      </div>
      <div className="status">{isConnected ? "✅ Connected" : "❌ Not Connected"}</div>
    </div>
  );
}
