// Level1.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BLE from "../components/ble";
import "./CSS/level1.css";

const ALPHABET = "abcde".split("");

export const Level1 = () => {
  const [charIndex, setCharIndex] = useState(0);
  const [bleData, setBleData] = useState("");
  const [sendFn, setSendFn] = useState<((msg: string) => Promise<void>) | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("level1_index");
    if (saved !== null) setCharIndex(Number(saved));
  }, []);

  useEffect(() => {
    if (!bleData) return;
    const expected = ALPHABET[charIndex];
    if (bleData.toLowerCase() === expected) {
      if (charIndex < ALPHABET.length - 1) {
        const next = charIndex + 1;
        setCharIndex(next);
        localStorage.setItem("level1_index", String(next));
      } else {
        localStorage.setItem("unlockedLevel", "2");
        navigate("/level2");
      }
    }
  }, [bleData]);

  useEffect(() => {
    if (sendFn) {
      const currentLetter = ALPHABET[charIndex];
      sendFn(currentLetter); // ⬅️ langsung kirim huruf otomatis
    }
  }, [sendFn, charIndex]);

  return (
    <div className="containerLv1">
      <div className="titleBox">Tempelkan 1 Huruf Seperti Pada Gambar</div>

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

      <div className="info">
        Huruf saat ini:{" "}
        <b>
          {ALPHABET[charIndex]} ({charIndex + 1}/{ALPHABET.length})
        </b>
      </div>

      {/* Komponen BLE */}
      <BLE onData={setBleData} onReady={setSendFn} />
    </div>
  );
};
