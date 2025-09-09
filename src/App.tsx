import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Level2 } from "./levels/Level2";
import { Level3 } from "./levels/Level3";
import { Level4 } from "./levels/Level4";
import { Home } from "./pages/Home";
import { Level1 } from "./levels/Level1";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level1" element={<Level1 />} />
        <Route path="/level2" element={<Level2 />} />
        <Route path="/level3" element={<Level3 />} />
        <Route path="/level4" element={<Level4 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
