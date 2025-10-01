import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level1.css";
import { useBLE } from "../components/BLEContext";

// Huruf-huruf yang harus discan
const ALPHABET = "abcfx".split("");

// Fungsi bantu delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Level1() {
  const { isConnected, send, subscribe } = useBLE();
  const navigate = useNavigate();

  // 📌 Simpan index huruf saat ini
  const [charIndex, setCharIndex] = useState(() => {
    const saved = localStorage.getItem("level1_index");
    return saved ? Number(saved) : 0;
  });

  // 📌 Ref untuk logic listener
  const charIndexRef = useRef(charIndex);
  const isWaitingResetRef = useRef(false);
  const lastWasWrongRef = useRef(false); // ✅ tracking kondisi terakhir

  // 🔁 Sinkronisasi ref
  useEffect(() => {
    charIndexRef.current = charIndex;
  }, [charIndex]);

  // 🔹 Listener BLE
  useEffect(() => {
    console.log("📡 Listener BLE aktif");

    const unsub = subscribe(async (msg) => {
      console.log("📥 Pesan dari alat:", msg);
      const currentIndex = charIndexRef.current;
      const currentLetter = ALPHABET[currentIndex];

      if (msg.startsWith("CORRECT")) {
        console.log(`✅ CORRECT (${currentLetter}) → delay lalu kirim RESET`);
        lastWasWrongRef.current = false;
        isWaitingResetRef.current = true;

        // ⏳ Delay 800ms sebelum kirim RESET
        await delay(2000);
        await send("RESET");
      } 
      else if (msg.startsWith("WRONG")) {
        console.log(`❌ WRONG (${currentLetter}) → delay lalu kirim RESET`);
        lastWasWrongRef.current = true;
        isWaitingResetRef.current = true;

        // ⏳ Delay 800ms sebelum kirim RESET
        await delay(2000);
        await send("RESET");
      } 
      else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        console.log("🔵 Alat siap puzzle baru");

        // Hanya proses jika sebelumnya kita sedang menunggu reset
        if (isWaitingResetRef.current) {
          isWaitingResetRef.current = false;

          if (lastWasWrongRef.current) {
            // ❌ Ulang huruf yang sama
            console.log(`↩️ Ulang huruf karena salah: ${currentLetter}`);
            // Delay kecil biar alat sempat biru dulu
            await delay(2000);
            await send(currentLetter);
          } else {
            // ✅ Lanjut huruf berikutnya
            const nextIndex = currentIndex + 1;
            if (nextIndex < ALPHABET.length) {
              const nextLetter = ALPHABET[nextIndex];
              console.log(`➡️ Kirim huruf berikut: ${nextLetter}`);

              setCharIndex(nextIndex);
              localStorage.setItem("level1_index", String(nextIndex));
              charIndexRef.current = nextIndex;

              // Delay kecil sebelum kirim huruf baru
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

  // 🔹 Saat pertama kali konek BLE
  useEffect(() => {
    if (isConnected) {
      const letter = ALPHABET[charIndexRef.current];
      console.log("📶 BLE siap, kirim huruf pertama:", letter);
      // Delay kecil agar alat siap
      (async () => {
        await delay(2000);
        await send(letter);
      })();
    }
  }, [isConnected, send]);

  const currentLetter = ALPHABET[charIndex];

  return (
    <div className="containerLv1">
      <div className="titleBox">Tempelkan Huruf Sesuai Gambar</div>

      <div className="board">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            {i === 0 ? (
              <div className="slot filled">
                <span className="letter">{currentLetter}</span>
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
          {currentLetter} ({charIndex + 1}/{ALPHABET.length})
        </b>
      </div>

      <div className="status">
        {isConnected ? "✅ Connected" : "❌ Not Connected"}
      </div>
    </div>
  );
}
