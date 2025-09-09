import { useEffect, useState } from "react";
import "./CSS/level1.css";
import { useNavigate } from "react-router-dom";

export const Level1 = () => {
  const [nextSlot, setNextSlot] = useState("A");
  const slot = ["A", "B", "C", "D"];
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("nextSlot_level1");
    if (saved) {
      setNextSlot(saved);
    }
  }, []);

  const handleClick = (lvl: string) => {
    const currentIndex = slot.indexOf(lvl);
    if (currentIndex < slot.length - 1) {
      const newSlot = slot[currentIndex + 1];
      setNextSlot(newSlot);
      localStorage.setItem("nextSlot_level1", newSlot);
    } else {
      const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "1");
      if (unlockedLevel < 2) {
        localStorage.setItem("unlockedLevel", "2");
      }
      navigate("/");
    }
  };

  return (
    <div className="containerLv1">
      <div className="titleBox">
        Tempelkan 1 Huruf <br /> Seperti Pada Gambar
      </div>

      <div className="board">
        {slot.map((lvl) => (
          <div key={lvl}>
            {lvl <= nextSlot ? (
              <div
                className="slot filled"
                onClick={lvl === nextSlot ? () => handleClick(lvl) : undefined}
              >
                <span className="letter">{lvl}</span>
              </div>
            ) : (
              <div className="slot"></div>
            )}
          </div>
        ))}
      </div>

      {nextSlot === "D" && (
        <div className="buttons">
          <button onClick={() => navigate("/")}>🏠 Kembali ke Home</button>
          <button
            onClick={() => {
              const unlockedLevel = Number(localStorage.getItem("unlockedLevel") || "1");
              if (unlockedLevel < 2) {
                localStorage.setItem("unlockedLevel", "2");
              }
              navigate("/level2");
            }}
          >
            ➡️ Lanjut Level 2
          </button>
        </div>
      )}
    </div>
  );
};
