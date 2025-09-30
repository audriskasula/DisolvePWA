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
  const [isSending, setIsSending] = useState(false); // ⛔ cegah overlap
  const navigate = useNavigate();

  // 🔹 Ambil progress dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("level1_index");
    if (saved !== null) setCharIndex(Number(saved));
  }, []);

  // 🔹 Fungsi aman untuk kirim BLE
  const safeSend = async (msg: string) => {
    if (!sendFn || isSending) {
      console.log("⚠️ Skip kirim, sedang kirim data lain:", msg);
      return;
    }
    try {
      setIsSending(true);
      console.log("📤 Kirim:", msg);
      await sendFn(msg);
      console.log("✅ Data terkirim:", msg);
    } catch (err) {
      console.error("❌ Gagal kirim data:", err);
    } finally {
      setIsSending(false);
    }
  };

  // 🔹 Fungsi bantu
  const kirimNetral = async () => {
    await safeSend("NEW_PUZZLE");
    await new Promise((r) => setTimeout(r, 700)); // beri waktu alat netral (biru)
  };

  const kirimHuruf = async (letter: string) => {
    await safeSend(letter);
  };

  // 🔹 Handle data BLE
  useEffect(() => {
    if (!bleData) return;

    console.log("📥 Diterima:", bleData);

    const handleCorrect = async () => {
      console.log("✅ CORRECT diterima");

      // 1️⃣ Kirim netral dulu
      await kirimNetral();

      // 2️⃣ Naikkan index dulu
      if (charIndex < ALPHABET.length - 1) {
        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);
        localStorage.setItem("level1_index", String(nextIndex));

        // 3️⃣ Tunggu sebentar agar state tersinkron
        await new Promise((r) => setTimeout(r, 300));

        // 4️⃣ Kirim huruf berikutnya
        await kirimHuruf(ALPHABET[nextIndex]);
      } else {
        console.log("🎉 Semua huruf benar, pindah ke level 2");
        localStorage.setItem("unlockedLevel", "2");
        navigate("/level2");
      }
    };

    const handleWrong = async () => {
      console.log("❌ WRONG diterima");

      // 1️⃣ Kirim netral dulu
      await kirimNetral();

      // 2️⃣ Kirim ulang huruf saat ini
      await kirimHuruf(ALPHABET[charIndex]);
    };

    const handleNewPuzzle = () => {
      console.log("🔵 Alat dalam posisi netral (NEW_PUZZLE)");
      // ❗ Tidak kirim apa pun, biar gak double
    };

    (async () => {
      if (bleData.startsWith("NEW_PUZZLE")) return handleNewPuzzle();
      if (bleData.startsWith("CORRECT")) return handleCorrect();
      if (bleData.startsWith("WRONG")) return handleWrong();
      if (bleData.startsWith("VICTORY")) console.log("🏆 Puzzle selesai!");
    })();
  }, [bleData, charIndex, navigate]);

  // 🔹 Saat BLE siap → kirim huruf awal
  useEffect(() => {
    if (!bleReady || !sendFn) return;
    (async () => {
      const current = ALPHABET[charIndex];
      await safeSend(current);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bleReady, sendFn]); // hanya sekali saat siap

  return (
    <div className="containerLv1">
      <div className="titleBox">Tempelkan 1 Huruf Seperti Pada Gambar</div>

      {/* papan huruf */}
      <div className="board">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            {i === 0 ? (
              <div className="slot filled">
                <span className="letter">{ALPHABET[charIndex]}</span>
              </div>
            ) : (
              <div className="slot" />
            )}
          </div>
        ))}
      </div>

      {/* info huruf */}
      <div className="info">
        Huruf saat ini:{" "}
        <b>
          {ALPHABET[charIndex]} ({charIndex + 1}/{ALPHABET.length})
        </b>
      </div>

      {/* BLE */}
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
