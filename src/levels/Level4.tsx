import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/level1.css";
import { useBLE } from "../components/BLEContext";

const COMBINATIONS = ["abcf", "cfbx", "fxab", "xbca", "acfx"];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Level4() {
  const { isConnected, send, subscribe } = useBLE();
  const navigate = useNavigate();

  const [index, setIndex] = useState(() => {
    const saved = localStorage.getItem("level4_index");
    return saved ? Number(saved) : 0;
  });

  const indexRef = useRef(index);
  const correctSetRef = useRef<Set<string>>(new Set());
  const waitingResetRef = useRef(false);

  useEffect(() => { indexRef.current = index; }, [index]);

  const currentCombo = COMBINATIONS[index];
  const allLetters = currentCombo.split("");

  useEffect(() => {
    const unsub = subscribe(async (msg) => {
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
      } else if (msg.startsWith("PUZZLE_RESET") || msg.startsWith("NEW_PUZZLE")) {
        if (waitingResetRef.current) {
          waitingResetRef.current = false;
          if (correctSetRef.current.size === allLetters.length) {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < COMBINATIONS.length) {
              setIndex(nextIndex);
              localStorage.setItem("level4_index", String(nextIndex));
              indexRef.current = nextIndex;
              correctSetRef.current.clear();
              await delay(2000);
              await send(COMBINATIONS[nextIndex]);
            } else {
              await send("VICTORY");
              localStorage.setItem("unlockedLevel", "5");
              navigate("/level5");
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
      <div className="titleBox">Level 4 — Kombinasi Huruf</div>
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
