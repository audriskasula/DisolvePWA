import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level.css";
import { useBLE } from "../components/BLEContext";
import { ALPHABET } from "./combinationLevel";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Level1() {
  const { isConnected, send, subscribe, connect } = useBLE(); // pastikan ada connect()
  const navigate = useNavigate();

  // 🔢 State index huruf
  const [charIndex, setCharIndex] = useState(() => {
    const saved = localStorage.getItem("level1_index");
    return saved ? Number(saved) : 0;
  });

  const charIndexRef = useRef(charIndex);
  const isWaitingResetRef = useRef(false);
  const lastWasWrongRef = useRef(false);

  // Sinkronisasi state dan ref
  useEffect(() => {
    charIndexRef.current = charIndex;
  }, [charIndex]);

  // 📡 Listener BLE
  useEffect(() => {
    console.log("📡 Listener BLE aktif");

    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);
      const currentIndex = charIndexRef.current;
      const currentLetter = ALPHABET[currentIndex];

      if (msg.startsWith("CORRECT")) {
        console.log(`✅ CORRECT (${currentLetter})`);
        lastWasWrongRef.current = false;
        isWaitingResetRef.current = true;
        await delay(2000);
        await send("RESET");
      }
      else if (msg.startsWith("WRONG")) {
        console.log(`❌ WRONG (${currentLetter})`);
        lastWasWrongRef.current = true;
        isWaitingResetRef.current = true;
        await delay(2000);
        await send("RESET");
      }
      else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        console.log("🔵 Alat siap puzzle baru");

        if (isWaitingResetRef.current) {
          isWaitingResetRef.current = false;

          if (lastWasWrongRef.current) {
            console.log(`↩️ Ulang huruf karena salah: ${currentLetter}`);
            await delay(2000);
            await send(currentLetter);
          } else {
            const nextIndex = currentIndex + 1;
            if (nextIndex < ALPHABET.length) {
              const nextLetter = ALPHABET[nextIndex];
              console.log(`➡️ Kirim huruf berikut: ${nextLetter}`);

              setCharIndex(nextIndex);
              localStorage.setItem("level1_index", String(nextIndex));
              charIndexRef.current = nextIndex;

              await delay(2000);
              await send(nextLetter);
            } else {
              console.log("🏁 Semua huruf benar, Level1 selesai!");
              await delay(2000);
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "2");
              navigate("/level2");
            }
          }
        }
      }
    });

    return () => {
      console.log("🛑 Listener BLE dilepas");
      unsub();
    };
  }, [send, subscribe, navigate]);

  // 📶 Saat konek pertama kali
  useEffect(() => {
    if (isConnected) {
      const letter = ALPHABET[charIndexRef.current];
      console.log("📶 BLE siap, kirim huruf pertama:", letter);
      (async () => {
        await delay(2000);
        await send(letter);
      })();
    }
  }, [isConnected, send]);

  const currentLetter = ALPHABET[charIndex];

  // 🧹 Fungsi reset per level
  const handleResetLevel = async () => {
    localStorage.removeItem("level1_index");
    setCharIndex(0);
    charIndexRef.current = 0;
    console.log("🔄 Level 1 direset, mulai dari awal");

    if (isConnected) {
      await delay(1000);
      await send(ALPHABET[0]); // kirim huruf pertama ulang
    }
  };

  return (
    <div className="containerLv1">
      <div className="level1-wrapper">
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

        <div className="titleBox">Tempelkan Huruf Sesuai Gambar</div>

        <div className="board">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`slot ${i === 0 ? "filled" : ""}`}>
              {i === 0 && <span className="letter">{currentLetter}</span>}
            </div>
          ))}
        </div>

        <div className="text-center px-5">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((charIndex + 1) / ALPHABET.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="info-progress">
            Progres: <strong>{charIndex + 1}</strong> / {ALPHABET.length}
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

          <div className={`status ${isConnected ? "ready" : "sending"}`}>
            {isConnected ? "✅ BLE Terhubung" : "🔌 Menunggu Koneksi..."}
          </div>
        </div>

      </div>
    </div>
  );
}
