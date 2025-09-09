import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Home = () => {
    const [unlockedLevel, setUnlockedLevel] = useState(1);

    useEffect(() => {
        const saved = localStorage.getItem("unlockedLevel");
        if (saved) {
            setUnlockedLevel(Number(saved));
        }
    }, []);

    const levels = [1, 2, 3, 4];

    return (
        <div
            // style={{ height: "100vh" }}
            className="background px-20 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {levels.map((lvl) => (
                    <div
                        key={lvl}
                        className="w-full h-80 bg-amber-50 flex items-center justify-center rounded-lg shadow-md"
                    >
                        {lvl <= unlockedLevel ? (
                            <Link
                                to={`/level${lvl}`}
                                className="text-xl font-bold text-blue-600"
                            >
                                Level {lvl}
                            </Link>
                        ) : (
                            <div className="text-gray-500 text-lg">🔒 Locked</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
