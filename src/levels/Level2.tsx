import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level.css";
import { useBLE } from "../components/BLEContext";
import { COMBINATIONS_LV2 } from "./combinationLevel";



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

  const currentCombo = COMBINATIONS_LV2[index];
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
            await delay(2000);
            await send("RESET");
          }
        }
      }
      else if (msg.startsWith("WRONG")) {
        console.log("❌ Salah → kirim RESET dan ulang kombinasi");
        waitingResetRef.current = true;
        correctSetRef.current.clear(); // reset progress
        await delay(2000);
        await send("RESET");
      }
      else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;
          // Kalau semua huruf benar → next combo
          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS_LV2.length) {
              setIndex(nextIndex);
              localStorage.setItem("level2_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              const nextCombo = COMBINATIONS_LV2[nextIndex];
              console.log(`➡️ Kirim kombinasi berikut: ${nextCombo}`);
              await delay(1000);
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
            await delay(1000);
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
        await delay(1000);
        await send(currentCombo);
      })();
    }
  }, [isConnected, send, currentCombo]);

  // 🔠 Tampilan UI
  return (
    <div className="containerLv1">
      <div className="level1-wrapper animate-fadeInScale">
        <div className="titleBox">Level 2</div>

        {/* <div className="info">
          <div className="info-label">Kombinasi Saat Ini</div>
          <div className="info-progress">
            <b>
              {currentCombo.toUpperCase()} ({index + 1}/{COMBINATIONS_LV2.length})
            </b>
          </div>
        </div> */}

        {/* Huruf board */}
        <div className="board">
          {currentCombo.split("").map((l, i) => (
            <div key={i} className="slot filled">
              <span className="letter">{l.toUpperCase()}</span>
            </div>
          ))}
          {Array.from({ length: 6 - currentCombo.length }).map((_, i) => (
            <div key={`empty-${i}`} className="slot" />
          ))}
        </div>

        <div className="text-center px-5">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((index + 1) / COMBINATIONS_LV2.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="info-progress">
            Progres: <strong>{index + 1}</strong> / {COMBINATIONS_LV2.length}
          </div>
        </div>

        <div className="flex justify-center items-center gap-7 px-5">
          <div className="ble-container">
            <div className="ble-status">
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            <div className="ble-note">
              Pastikan alat BLE aktif dan terhubung
            </div>
          </div>

          <div
            className={`status ${isConnected ? "ready" : "sending"
              }`}
          >
            {isConnected ? "✅ BLE Terhubung" : "🔌 Menunggu Koneksi..."}
          </div>
        </div>
      </div>
    </div>
  );
}
