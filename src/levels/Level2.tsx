import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level1.css";
import { useBLE } from "../components/BLEContext";

// 📌 Kombinasi huruf untuk level 2
const COMBINATIONS = ["ab", "cf", "ba", "ac", "fb"];

// 📌 Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Level2() {
  const { isConnected, send, subscribe } = useBLE();
  const navigate = useNavigate();

  // Index kombinasi aktif
  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("level2_index");
    return saved ? Number(saved) : 0;
  });

  const indexRef = useRef(index);
  const correctSetRef = useRef<Set<string>>(new Set()); // huruf yang sudah CORRECT
  const waitingResetRef = useRef(false);

  // Sinkronisasi index
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const currentCombo = COMBINATIONS[index];
  const allLetters = currentCombo.split("");

  // Listener BLE
  useEffect(() => {
    console.log("📡 Listener BLE aktif Level2");

    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);

      if (msg.startsWith("CORRECT:")) {
        const letter = msg.split(":").pop()?.trim();
        if (letter && allLetters.includes(letter)) {
          console.log(`✅ Huruf benar: ${letter}`);
          correctSetRef.current.add(letter);

          // Cek apakah semua huruf dalam kombinasi sudah CORRECT
          if (correctSetRef.current.size === allLetters.length) {
            console.log("🎉 Semua huruf kombinasi benar → kirim RESET & lanjut");
            waitingResetRef.current = true;
            await delay(700);
            await send("RESET");
          }
        }
      } 
      else if (msg.startsWith("WRONG")) {
        console.log("❌ Salah → kirim RESET dan ulang kombinasi");
        waitingResetRef.current = true;
        correctSetRef.current.clear(); // reset progress
        await delay(700);
        await send("RESET");
      } 
      else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;
          // Kalau semua huruf benar → next combo
          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS.length) {
              setIndex(nextIndex);
              localStorage.setItem("level2_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              const nextCombo = COMBINATIONS[nextIndex];
              console.log(`➡️ Kirim kombinasi berikut: ${nextCombo}`);
              await delay(500);
              await send(nextCombo);
            } else {
              console.log("🏁 Level2 selesai!");
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "3");
              navigate("/level3");
            }
          } else {
            // belum lengkap → kirim ulang kombinasi
            console.log(`↩️ Ulang kombinasi: ${currentCombo}`);
            await delay(500);
            await send(currentCombo);
          }
        }
      }
    });

    return () => {
      console.log("🛑 Listener BLE dilepas Level2");
      unsub();
    };
  }, [send, subscribe, navigate, currentCombo, allLetters]);

  // Kirim kombinasi pertama saat terkoneksi
  useEffect(() => {
    if (isConnected) {
      console.log("📶 BLE siap, kirim kombinasi pertama:", currentCombo);
      (async () => {
        await delay(500);
        await send(currentCombo);
      })();
    }
  }, [isConnected, send, currentCombo]);

  // 🔠 Tampilan tetap sama
  return (
    <div className="containerLv1">
      <div className="titleBox">Level 2 — Kombinasi Huruf</div>

      <div className="board">
        {currentCombo.split("").map((l, i) => (
          <div key={i} className="slot filled">
            <span className="letter">{l}</span>
          </div>
        ))}
        {Array.from({ length: 6 - currentCombo.length }).map((_, i) => (
          <div key={`empty-${i}`} className="slot" />
        ))}
      </div>

      <div className="info">
        Kombinasi saat ini:{" "}
        <b>
          {currentCombo} ({index + 1}/{COMBINATIONS.length})
        </b>
      </div>

      <div className="status">
        {isConnected ? "✅ Connected" : "❌ Not Connected"}
      </div>
    </div>
  );
}
