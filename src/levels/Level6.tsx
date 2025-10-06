import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level.css"; // ✅ Pakai CSS elegan dari Bang
import { useBLE } from "../components/BLEContext";

const COMBINATIONS = ["tembok", "lembah", "bentuk", "gurita", "petani", "perahu", "pisang", "lembar", "kapten", "pelaku"];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Level6() {
  const { isConnected, send, subscribe } = useBLE();
  const navigate = useNavigate();

  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("level6_index");
    return saved ? Number(saved) : 0;
  });

  const indexRef = useRef(index);
  const correctSetRef = useRef<Set<string>>(new Set());
  const waitingResetRef = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const currentCombo = COMBINATIONS[index];
  const allLetters = currentCombo.split("");

  useEffect(() => {
    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);

      if (msg.startsWith("CORRECT:")) {
        const letter = msg.split(":").pop()?.trim();
        if (letter && allLetters.includes(letter)) {
          correctSetRef.current.add(letter);
          if (correctSetRef.current.size === allLetters.length) {
            waitingResetRef.current = true;
            await delay(2000);
            await send("RESET");
          }
        }
      } else if (msg.startsWith("WRONG")) {
        waitingResetRef.current = true;
        correctSetRef.current.clear();
        await delay(2000);
        await send("RESET");
      } else if (
        msg.startsWith("PUZZLE_RESET") ||
        msg.startsWith("NEW_PUZZLE")
      ) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;

          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS.length) {
              setIndex(nextIndex);
              localStorage.setItem("level6_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              await delay(2000);
              await send(COMBINATIONS[nextIndex]);
            } else {
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "6");
              alert("🎉 SELAMAT! Semua level selesai!");
              navigate("/");
            }
          } else {
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
      (async () => {
        await delay(2000);
        await send(currentCombo);
      })();
    }
  }, [isConnected, send, currentCombo]);

  return (
    <div className="containerLv1">
      <div className="level1-wrapper">
        <div className="titleBox">Level 6 — Kombinasi Huruf</div>

        {/* 🧩 Board huruf */}
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

        {/* 📈 Info + Progress */}
        <div className="text-center px-5">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((index + 1) / COMBINATIONS.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="info-progress">
            Progres: <strong>{index + 1}</strong> / {COMBINATIONS.length}
          </div>
        </div>

        {/* 🛰 Status BLE */}
        <div className={`status ${isConnected ? "ready" : "sending"}`}>
          {isConnected ? "✅ BLE Terhubung" : "🔌 Menunggu Koneksi..."}
        </div>
      </div>
    </div>
  );
}
