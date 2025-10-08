import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level.css";
import { useBLE } from "../components/BLEContext";
// import { COMBINATIONS_LV4 } from "./combinationLevel";

const COMBINATIONS = ["ulat", "daun", "duta", "nadi", "musa"];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Level4() {
  const { isConnected, send, subscribe, connect } = useBLE();
  const navigate = useNavigate();

  // 🧠 Simpan dan ambil progress dari localStorage
  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("level4_index");
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

  // 📡 Listener BLE
  useEffect(() => {
    console.log("📡 Listener BLE aktif Level4");

    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);

      if (msg.startsWith("CORRECT:")) {
        const letter = msg.split(":").pop()?.trim();
        if (letter && allLetters.includes(letter)) {
          correctSetRef.current.add(letter);
          console.log(`✅ Huruf benar: ${letter}`);

          // Semua huruf benar → kirim RESET
          if (correctSetRef.current.size === allLetters.length) {
            console.log("🎉 Semua huruf benar → kirim RESET");
            waitingResetRef.current = true;
            await delay(2000);
            await send("RESET");
          }
        }
      }
      else if (msg.startsWith("WRONG")) {
        console.log("❌ Salah → kirim RESET dan ulang");
        waitingResetRef.current = true;
        correctSetRef.current.clear();
        await delay(2000);
        await send("RESET");
      }
      else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;

          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS.length) {
              setIndex(nextIndex);
              localStorage.setItem("level4_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              const nextCombo = COMBINATIONS[nextIndex];
              console.log(`➡️ Kirim kombinasi berikut: ${nextCombo}`);
              await delay(2000);
              await send(nextCombo);
            } else {
              console.log("🏁 Level4 selesai");
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "5");
              navigate("/level5");
            }
          } else {
            console.log(`↩️ Ulang kombinasi: ${currentCombo}`);
            await delay(2000);
            await send(currentCombo);
          }
        }
      }
    });

    return () => {
      console.log("🛑 Listener BLE dilepas Level4");
      unsub();
    };
  }, [send, subscribe, navigate, currentCombo, allLetters]);

  // 📤 Kirim kombinasi pertama saat BLE tersambung
  useEffect(() => {
    if (isConnected) {
      console.log("📶 Kirim kombinasi pertama:", currentCombo);
      (async () => {
        await delay(2000);
        await send(currentCombo);
      })();
    }
  }, [isConnected, send, currentCombo]);

  const handleResetLevel = async () => {
    localStorage.removeItem("level1_index");
    setIndex(0);
    indexRef.current = 0;
    console.log("🔄 Level 1 direset, mulai dari awal");

    if (isConnected) {
      await delay(1000);
      await send(COMBINATIONS[0]); // kirim huruf pertama ulang
    }
  };

  return (
    <div className="containerLv1">
      <div className="level1-wrapper animate-fadeInScale">
        <div className="flex gap-4">
          <button className="btn-back cursor-pointer flex justify-center items-center flex-col-reverse gap-2" onClick={() => navigate("/")}>
            <p>Home</p>
            <img src="homeIcon.svg" alt="" />
          </button>
          <button className="btn-reset cursor-pointer flex justify-center items-center flex-col-reverse gap-2"
            onClick={handleResetLevel}>
            <p>Reset Level</p>
            <img src="refreshIcon.svg" alt="" />
          </button>
          <button className="btn-connect cursor-pointer flex justify-center items-center flex-col-reverse gap-1"
            onClick={async () => {
              try {
                await connect();
              } catch (e) {
                console.error("❌ Gagal konek BLE:", e);
              }
            }}>
            <p>Reconnect</p>
            <img src="bluetoothIcon.svg" alt="" width={28} />
          </button>
        </div>
        <div className="titleBox">Level 4</div>

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

        <div className="info">
          Kombinasi saat ini:{" "}
          <b>
            {currentCombo} ({index + 1}/{COMBINATIONS.length})
          </b>
        </div>

        <div className={`status ${isConnected ? "ready" : "sending"}`}>
          {isConnected ? "✅ Connected" : "❌ Not Connected"}
        </div>
      </div>
    </div>
  );
}
